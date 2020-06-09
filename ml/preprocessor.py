from textblob import TextBlob
from .sanitizer import sanitize
from .response import Response
import datetime

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
        for tweet in tweet_list:
            if tweet.polarity > 0:
                positive_sentiment = positive_sentiment + 1
            elif tweet.polarity < 0:
                negative_sentiment = negative_sentiment + 1
            else:
                neutral = neutral + 1

        date = ""
        if len(tweet_list) > 0:
            date = tweet_list[0].date.strftime("%d %b")
            old_date = tweet_list[0].date
        else:
            undef_date = old_date - datetime.timedelta(days=7)
            date = undef_date.strftime("%d %b")
            old_date = undef_date

        time_fragment = TimeFragment(positive_sentiment, negative_sentiment, neutral, date)
        result.append(time_fragment.serialize())
    return result


def compile_result(tweets):
    # tweets.sort(key=lambda r: r.date)
    return count_sentiment(tweets)


class TimeFragment:
    def __init__(self, positive, negative, neutral, name):
        self.positive = positive
        self.negative = negative
        self.neutral = neutral
        self.name = name

    def serialize(self):
        return {
            "name": self.name,
            "positive": self.positive,
            "negative": self.negative,
            "neutral": self.neutral
        }
