from flask import Flask, jsonify, render_template, request, json
from scraper import scraper
from ml import preprocessor
from validator.ErrorClass import ErrorResponse
from validator import validator
import nltk
import time;
from rq import Queue
from redis import Redis
from db_ops.db_ops import DbOps
from models import Jobs, Query
import jsonpickle
from bson.json_util import dumps
redis_conn = Redis()
step_count = 7
MONGO_URI = 'mongodb://127.0.0.1:27017'
MONGO_DB_URI = 'mongodb://127.0.0.1:27017/satori'
QUERY_STATUS_PATH = "query_status"
COMPUTED_RESULT = "computed_res"
try:
    nltk.download('punkt', download_dir='/opt/python/current/app')
    nltk.download('stopwords', download_dir='/opt/python/current/app')
except:
    nltk.download('punkt')
    nltk.download('stopwords')

app = Flask(__name__, template_folder="templates")
app.config['MONGO_URI'] = MONGO_URI
db = DbOps(MONGO_URI)


# @app.route('/', methods=['GET'])
# def home():
#     return render_template('search.html', response='')


@app.route('/', methods=['GET'])
def search_result():
    return render_template('index.html', response='')


@app.route('/', methods=['POST'])
def scrape_data():
    search_json = validator.clean_response(request.get_json())

    if isinstance(search_json, ErrorResponse):
        return app.response_class(response=json.dumps(search_json.serialize()),
                                  status=search_json.code,
                                  mimetype='application/json')
    did = db.create_new_document("query", search_json)
    search_query = Query.SearchQuery(search_json['query'], search_json['startDate'], search_json['endDate'],
                                     search_json['stepCount'], search_json['tweetFrequency'])
    job_list = scraper.scrape(search_query, did, MONGO_URI)

    # processed_tweets = preprocessor.analyze(tweets)
    # response = preprocessor.compile_result(processed_tweets)
    # return render_template('index.html', response='')
    for job in job_list:
        db.update(did, "job_list." + job, Jobs.JobClass(job).serialize())
    db.update(did, "timestamp", str(time.time()))
    return app.response_class(response=json.dumps({"id": did}),
                              status=200,
                              mimetype='application/json')


@app.route('/tasks/<task_id>', methods=['POST'])
def get_status(task_id):
    # TODO: validate task_id
    res = db.get_jobs_status(task_id)
    print(res)
    print(type(res))
    job_list = res.get('jobs_status_array')
    total_jobs = 0
    if job_list:
        for key, value in job_list.items():
            if value != 0:
                total_jobs = total_jobs + 1
        percentage = int((total_jobs * 100) / len(job_list))
    else:
        percentage = 0

    task_status = "queued"
    if percentage >= 100:
        task_status = "finished"

    response_object = {
        "data": {
            "task_id": task_id,
            "task_status": task_status,
            "task_percentage": percentage
        }
    }
    return jsonify(response_object)


@app.route('/get_result/<task_id>', methods=['POST', 'GET'])
def get_result(task_id):
    # TODO: validate task_id
    res = db.read_from_db(task_id)
    job_list = res['job_list']
    total_jobs = 0
    computed_res = res.get(COMPUTED_RESULT)
    # if the result is already calculated then send
    # already computed response.
    if computed_res:
        return jsonify(computed_res)

    finished_job_list = []
    for key, value in job_list.items():
        job_res = value['job_res']
        if job_res is not None:
            total_jobs = total_jobs + 1
            finished_job_list.append([value['job_date'], jsonpickle.decode(job_res)])

    if len(finished_job_list) > 0:
        # which means all jobs completed;
        # write to db
        db.update(task_id, QUERY_STATUS_PATH, "finished")
        response = post_processing(finished_job_list)
        db.update(task_id, COMPUTED_RESULT, response)
        return jsonify(response)
        # return app.response_class(response=jsonify(response),
        #                           status=200,
        #                           mimetype='application/json')
    else:
        return app.response_class(response=json.dumps(ErrorResponse(200, "Not all jobs are complete.").serialize()),
                                  status=200,
                                  mimetype='application/json')


def post_processing(finished_job_list):
    # job_result_array = []
    # for job in finished_job_list:
    #     job_result_array.append(job.result)
    processed_tweets = preprocessor.analyze(tweets=finished_job_list)
    return preprocessor.compile_result(processed_tweets)


@app.route('/get_history/', methods=['POST'])
def get_recent_history():
    # TODO:validate this array.
    queryIdArray = request.get_json()
    # TODO:add pagination
    batch = db.get_queries_batch(queryIdArray)

    return app.response_class(response=dumps(batch),
                              status=200,
                              mimetype='application/json')


@app.route('/get_old_history/', methods=['POST'])
def get_old_history():
    # TODO: validate last json
    request_json = request.get_json()
    lastQueryId = request_json['lastId']
    queryIdArray = request_json['queriesArray']

    batch = db.get_old_queries_batch(lastQueryId, queryIdArray)
    return app.response_class(response=dumps(batch),
                              status=200,
                              mimetype='application/json')


if __name__ == '__main__':
    app.run(debug=True)
