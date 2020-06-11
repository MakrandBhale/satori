from textblob import TextBlob
from .sanitizer import sanitize
from nltk.tokenize import word_tokenize
import nltk
import string
import datetime

# nltk.download('stopwords')
from nltk.corpus import stopwords

POSITIVE = 1
NEGATIVE = 0
DAY, WEEK = 0, 1
MONTH, YEAR = 3, 4


def analyze(tweets):
    object_list = []
    for time_fragment in tweets:
        time_fragment_list = []
        for tweet in time_fragment:
            text = tweet.text
            blob = TextBlob(text)
            tweet.add_emotion(blob.polarity, blob.subjectivity)
            time_fragment_list.append(tweet)
        object_list.append(time_fragment_list)
    return object_list


def count_sentiment(tweets):
    old_date = datetime.datetime.today()
    result = []
    for tweet_list in tweets:
        positive_sentiment = 0
        negative_sentiment = 0
        neutral = 0
        total = 0
        for tweet in tweet_list:
            if tweet.polarity > 0:
                positive_sentiment = positive_sentiment + 1
            elif tweet.polarity < 0:
                negative_sentiment = negative_sentiment + 1
            else:
                neutral = neutral + 1
            total = total + 1
        date = ""
        if len(tweet_list) > 0:
            date = tweet_list[0].date.strftime("%d %b")
            old_date = tweet_list[0].date
        else:
            undef_date = old_date - datetime.timedelta(days=7)
            date = undef_date.strftime("%d %b")
            old_date = undef_date

        time_fragment = TimeFragment(positive_sentiment, negative_sentiment, neutral, total, date)
        result.append(time_fragment.serialize())
    return result


def cleanTweets(tweet):
    # splitting into words
    tokens = word_tokenize(tweet.text)
    # convert to lower case
    tokens = [w.lower() for w in tokens]
    # remove punctuation from each word
    table = str.maketrans('', '', string.punctuation)
    stripped = [w.translate(table) for w in tokens]
    # remove remaining tokens that are not alphabetic
    words = [word for word in stripped if word.isalpha()]
    # filter out stop words
    stop_words = set(stopwords.words('english'))
    words = [w for w in words if not w in stop_words]
    return words


def wordCloud(tweets):
    corpus = []
    for tweet_list in tweets:
        for tweet in tweet_list:
            list_of_words = cleanTweets(tweet)
            corpus.extend(list_of_words)

    cloud = nltk.FreqDist(corpus).most_common(10)
    print(cloud)
    return cloud


def compile_result(tweets):
    # tweets.sort(key=lambda r: r.date)

    response = Response(count_sentiment(tweets), wordCloud(tweets))
    return response.serialize()


class Response:
    def __init__(self, timeFragment, freqDist):
        self.timeFragment = timeFragment
        self.freqDist = freqDist

    def serialize(self):
        return {
            "timeFragment": self.timeFragment,
            "freqDist": self.freqDist
        }


class TimeFragment:
    def __init__(self, positive, negative, neutral, total, name):
        self.positive = positive
        self.negative = negative
        self.neutral = neutral
        self.total = total
        self.name = name

    def serialize(self):
        return {
            "name": self.name,
            "positive": self.positive,
            "negative": self.negative,
            "total": self.total,
            "neutral": self.neutral
        }
