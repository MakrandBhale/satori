from credentials import twitter_cred
import tweepy
from tweepy import Stream
from delegates.sanitizer import Tweet
import json
from textblob import TextBlob
auth = tweepy.OAuthHandler(twitter_cred.CONSUMER_KEY, twitter_cred.CONSUMER_SECRET)
auth.set_access_token(twitter_cred.ACCESS_TOKEN, twitter_cred.ACCESS_TOKEN_SECRET)

api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)


class StreamListener(tweepy.StreamListener):
    count = 0
    should_run = True

    def __init__(self, dbOps, did):
        self.dbOps = dbOps
        self.did = did

    def on_data(self, raw_data):
        tweet_dict = json.loads(raw_data)
        # TODO: hashtags are added directly needs work.
        self.count += 1
        print(tweet_dict)
        print(self.count)
        tweet = Tweet(
            tweet_dict['user']['id'],
            tweet_dict['favorite_count'],
            tweet_dict['timestamp_ms'],
            tweet_dict['created_at'],
            tweet_dict['entities']['hashtags'],
            tweet_dict['entities']['user_mentions'],
            tweet_dict['reply_count'],
            tweet_dict['retweet_count'],
            tweet_dict['text'],
            tweet_dict['entities']['user_mentions'],
            tweet_dict['entities']['urls'],
            tweet_dict['user']['screen_name'],
        )
        self.count = self.count + 1
        blob = TextBlob(tweet.text)
        sentiment = blob.polarity
        self.updateDb(sentiment)
        return self.should_run

    def updateDb(self, sentiment):
        # TODO: update this to run every second, instead of instantly
        if sentiment > 0:
            self.dbOps.increment_streams(self.did, "positive")
        elif sentiment < 0:
            self.dbOps.increment_streams(self.did, "negative")
        else:
            self.dbOps.increment_streams(self.did, "neutral")

    def on_status(self, status):
        print(status)

    def on_error(self, status_code):
        print("----- ERROR ----", status_code)

    def stop_stream(self):
        self.should_run = False


def stream_data(keyword, dbOps, did):
    listener = StreamListener(dbOps, did)
    stream = Stream(auth, listener)
    stream.filter(track=[keyword], is_async=True)

