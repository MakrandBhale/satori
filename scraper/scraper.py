from datetime import timedelta, datetime
import GetOldTweets3 as got
from ml import sanitizer
import redis
from rq import Queue, get_current_job
from ml.step_count_generator import get_substraction_factor
import uuid
from db_ops.db_ops import DbOps
import jsonpickle

r = redis.Redis()
q = Queue(connection=r)


def scrape(searchQuery, did, mongo_uri):
    # did is used to update the task's result and status to the database
    # this is the id of document.
    beginDate = datetime.strptime(searchQuery.startDate, "%Y-%m-%d").date()
    lastDate = datetime.strptime(searchQuery.endDate, "%Y-%m-%d").date()
    final_list = []

    # a substraction_factor decides the step to take to reach the end date.
    # a number is added to the begin date at every iteration. this number is substraction factor.
    # should have named addition factor (face-palm)
    substraction_factor = get_substraction_factor(searchQuery.stepSize)

    while beginDate <= lastDate:
        # start from begin date and end when it get over it.
        previous_date = beginDate + timedelta(days=substraction_factor)

        # generating unique ids beforehand so that it can be used to update
        # task status later by the same function

        job = q.enqueue(scrape_tweet, searchQuery.query, str(beginDate), str(previous_date), searchQuery.frequency,
                        mongo_uri, did)
        # result = scrape_tweet(
        #     query,
        #     str(beginDate),
        #     str(previous_date),
        #     frequency
        # )
        beginDate = previous_date
        final_list.append(job.id)
    return final_list


def scrape_tweet(query, begin_date, end_date, limit, mongo_uri, did):
    db = DbOps(mongo_uri)
    # db = DbOps(client)
    current_job = get_current_job()
    db.update(did, "job_list." + current_job.id + ".job_status", current_job.get_status())

    tweet_criteria = got.manager.TweetCriteria().setQuerySearch(query) \
        .setSince(begin_date) \
        .setUntil(end_date) \
        .setMaxTweets(limit)
    tweets = got.manager.TweetManager.getTweets(tweet_criteria)
    # updating job details in the db
    # db= db object; did = document id; uid = job_id;

    # print(str(data_collection.insert({get_current_job().id: "true"})))
    # db.update({"_id": ObjectId(did)}, {'$set': {"job_list." + current_job.id + ".job_status":
    # current_job.get_status()}})

    some_obj = sanitizer.wrap(tweets)
    json_obj = jsonpickle.encode(some_obj)
    db.update(did, "job_list." + current_job.id + ".job_date", str(begin_date))
    db.update(did, "job_list." + current_job.id + ".job_status", current_job.get_status())
    db.update(did, "job_list." + current_job.id + ".job_res", json_obj)
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
