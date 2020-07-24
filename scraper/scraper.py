from datetime import timedelta, datetime
import GetOldTweets3 as got
from delegates import sanitizer
import redis
from rq import Queue, get_current_job
from delegates.step_count_generator import get_substraction_factor
import uuid
from db_ops.db_ops import DbOps
import jsonpickle

r = redis.Redis()
q = Queue(connection=r)


def scrape(searchQuery, did, mongo_uri):
    db = DbOps(mongo_uri)

    # did is used to update the task's result and status to the database
    # this is the id of document.
    beginDate = datetime.strptime(searchQuery.startDate, "%Y-%m-%d").date()
    lastDate = datetime.strptime(searchQuery.endDate, "%Y-%m-%d").date()
    final_list = []

    # a substraction_factor decides the step to take to reach the end date.
    # a number is added to the begin date at every iteration. this number is substraction factor.
    # should have named addition factor (face-palm)
    substraction_factor = get_substraction_factor(searchQuery.stepSize)

    while True:
        # start from begin date and end when it get over it.
        previous_date = beginDate + timedelta(days=substraction_factor)

        # generating unique ids beforehand so that it can be used to update
        # task status later by the same function

        job = q.enqueue(scrape_tweet, searchQuery.query, str(beginDate), str(previous_date), searchQuery.frequency,
                        mongo_uri, did, job_timeout='1h')
        # result = scrape_tweet(
        #     query,
        #     str(beginDate),
        #     str(previous_date),
        #     frequency
        # )
        db.update(did, "jobs_status_array." + job.id, 0)
        db.update(did, "query_status", "queued")
        db.close_connection()
        beginDate = previous_date
        final_list.append(job.id)
        if beginDate >= lastDate:
            break
    return final_list


def scrape_tweet(query, begin_date, end_date, limit, mongo_uri, did):
    db = DbOps(mongo_uri)
    # db = DbOps(client)
    current_job = get_current_job()
    print("id : ", current_job.id)
    print("status: ", current_job.get_status())
    db.update(did, "job_list." + current_job.id + ".job_status", current_job.get_status())
    db.update(did, "jobs_status_array." + current_job.id, 0)
    tweet_criteria = got.manager.TweetCriteria().setQuerySearch(query) \
        .setSince(begin_date) \
        .setUntil(end_date) \
        .setMaxTweets(limit)
    tweets = got.manager.TweetManager.getTweets(tweet_criteria)

    print(str(begin_date))
    print("Total tweets: " + str(len(tweets)))
    db.update(did, "job_list." + current_job.id + ".job_date", str(begin_date) + "-" + str(end_date))
    db.update(did, "job_list." + current_job.id + ".job_status", "finished")

    some_obj = sanitizer.wrap(tweets)
    json_obj = jsonpickle.encode(some_obj)
    db.update(did, "job_list." + current_job.id + ".job_res", json_obj)
    db.update(did, "jobs_status_array." + current_job.id, 1)
    res = db.get_value_by_key(did, 'total_tweets')
    count = len(tweets)
    if res:
        count = count + res['total_tweets']

    db.update(did, "total_tweets", count)
    db.close_connection()
    # array of twit objects to json array

    # return [str(begin_date), some_obj]

#
# tweets = scrape("#blacklivesmatter")
# for t in tweets:
#     print(t.text)

# tweets = qt(QUERY, limit=limit, lang=lang)
# type(tweets)
#
# df = pd.DataFrame(t.__dict__ for t in tweets)
