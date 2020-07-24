class Tweet:
    polarity = None
    subjectivity = None

    def __init__(self, author_id, favorites, date, formatted_date, hashtags, mentions, replies, retweets, text, to, urls,
                 username):
        self.author_id = author_id
        self.favorites = favorites
        self.date = date
        self.formatted_date = formatted_date
        self.hashtags = hashtags
        self.mentions = mentions
        self.replies = replies
        self.retweets = retweets
        self.text = text
        self.to = to
        self.urls = urls
        self.username = username

    def serialize(self):
        return {
            "author_id": self.author_id,
            "favorites": self.favorites,
            "date": self.date,
            "formatted_date": self.formatted_date,
            "hashtags": self.hashtags,
            "mentions": self.mentions,
            "replies": self.replies,
            "retweets": self.retweets,
            "text": self.text,
            "to": self.to,
            "urls": self.urls,
            "username": self.username,
            "subjectivity": self.subjectivity,
            "polarity": self.polarity
        }

    def add_emotion(self, polarity, subjectivity):
        self.polarity = polarity
        self.subjectivity = subjectivity


def wrap(tweets):
    object_list = []
    # a wrapper function to change the class of the scraped tweets to our own class
    for t in tweets:
        tweet = Tweet(
            t.author_id,
            t.favorites,
            t.date,
            t.formatted_date,
            t.hashtags,
            t.mentions,
            t.replies,
            t.retweets,
            t.text,
            t.to,
            t.urls,
            t.username
        )
        object_list.append(tweet)

    return object_list


def sanitize(tweets):
    response = []
    for t in tweets:
        response.append(t.serialize())
    return response
