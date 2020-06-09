class Response:

    def __init__(self, size, positive_tweets, negative_tweets, neutral_tweets, timeline):
        self.total_tweets = size
        self.positive_tweets = positive_tweets
        self.negative_tweets = negative_tweets
        self.timeline = timeline
        self.neutral_tweets = neutral_tweets

    def serialize(self):
        return {
            "total_tweets": self.total_tweets,
            "positive_tweets": self.positive_tweets,
            "negative_tweets": self.negative_tweets,
            "neutral_tweets": self.neutral_tweets,
            "timeline": self.timeline
        }
