from textblob import TextBlob
from .extractor import url_extractor, url_cleaner
from nltk.tokenize import word_tokenize
import nltk
import string
import datetime

from nltk.corpus import stopwords

POSITIVE = 1
NEGATIVE = 0
DAY, WEEK = 0, 1
MONTH, YEAR = 3, 4


# def analyze(tweets):
#     time_fragment_list = []
#     object_list = []
#     for tweet in tweets:
#         text = tweet.text
#         blob = TextBlob(text)
#         tweet.add_emotion(blob.polarity, blob.subjectivity)
#         time_fragment_list.append(tweet)
#     object_list.append(time_fragment_list)
#     return object_list
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
            date = str(tweet_list[0].date.timestamp())
            old_date = tweet_list[0].date
        else:
            # TODO : change undefined time delta *IMP*
            undef_date = old_date - datetime.timedelta(days=7)
            date = (undef_date.timestamp())
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
    links_corpus = []

    for tweet_list in tweets:
        for tweet in tweet_list:
            links_corpus.extend(url_extractor(tweet.text))
            tweet.text = url_cleaner(tweet.text)
            list_of_words = cleanTweets(tweet)
            corpus.extend(list_of_words)

    cloud = nltk.FreqDist(corpus).most_common(5)
    link_cloud = nltk.FreqDist(links_corpus).most_common(10)
    # print(link_cloud)
    return [cloud, link_cloud]


def compile_result(tweets):
    # tweets.sort(key=lambda r: r.date)
    freqDist = wordCloud(tweets)

    response = Response(count_sentiment(tweets), freqDist[0], freqDist[1], '[]')
    return response.serialize()


class Response:
    def __init__(self, timeFragment, wordFreqDist, linkFreqDist, hashtagFreqDist):
        self.timeFragment = timeFragment
        self.wordFreqDist = wordFreqDist
        self.linkFreqDist = linkFreqDist
        self.hashtagFreqDist = hashtagFreqDist

    def serialize(self):
        return {
            "timeFragment": self.timeFragment,
            "freqDist": self.wordFreqDist,
            "linkFreqDist": self.linkFreqDist,
            "hashtagFreqDist": self.hashtagFreqDist
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
