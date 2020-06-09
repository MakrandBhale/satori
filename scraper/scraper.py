import pandas as pd

from datetime import date, timedelta
import GetOldTweets3 as got
from ml import sanitizer

MONTH = 0
HALF_YEAR = 1


def scrape(query, timespan, limit=100):
    final_list = []
    if timespan == MONTH:
        daily_limit = int(limit//7)
        for x in range(0,60,7):
            result = scrapeTweet(
                query,
                str(date.today() - timedelta(days=(x+7))),
                str(date.today() - timedelta(days=x)),
                daily_limit
            )
            final_list.append(result)
        return final_list


def scrapeTweet(query, begin_date=str(date.today() - timedelta(days=5)), end_date=str(date.today()), limit=100):
    tweet_criteria = got.manager.TweetCriteria().setQuerySearch(query) \
        .setSince(begin_date) \
        .setUntil(end_date) \
        .setMaxTweets(limit)
    tweets = got.manager.TweetManager.getTweets(tweet_criteria)
    # array of twit objects to json array
    return sanitizer.wrap(tweets)

#
# tweets = scrape("#blacklivesmatter")
# for t in tweets:
#     print(t.text)

# tweets = qt(QUERY, limit=limit, lang=lang)
# type(tweets)
#
# df = pd.DataFrame(t.__dict__ for t in tweets)
