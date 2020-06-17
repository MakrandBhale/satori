import pandas as pd

from datetime import date, timedelta, datetime
import GetOldTweets3 as got
from ml import sanitizer

DAYS = '0'
WEEK = '1'
HALF_MONTH = '2'
MONTH = '3'


def get_default_start_date():
    start_date = datetime.today() - timedelta(days=30)
    return


def get_default_endDate():
    return datetime.today().strftime("%Y-%m-%d")


def scrape(query, stepSize=WEEK, frequency='10', startDate=get_default_start_date(), endDate=get_default_endDate()):
    beginDate = datetime.strptime(startDate, "%Y-%m-%d").date()
    lastDate = datetime.strptime(endDate, "%Y-%m-%d").date()
    final_list = []

    # a substraction_factor decides the step to take to reach the end date.
    # a number is added to the begin date at every iteration. this number is substraction factor.
    # should have named addition factor (face-palm)
    substraction_factor = 7
    if stepSize == MONTH:
        substraction_factor = 30
    elif stepSize == HALF_MONTH:
        substraction_factor = 15
    elif stepSize == DAYS:
        substraction_factor = 1

    while beginDate <= lastDate:
        # start from begin date and end when it get over it.
        previous_date = beginDate + timedelta(days=substraction_factor)
        result = scrapeTweet(
            query,
            str(beginDate),
            str(previous_date),
            int(frequency)
        )
        beginDate = previous_date
        final_list.append(result)
    return final_list


def scrapeTweet(query, begin_date, end_date, limit):
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
