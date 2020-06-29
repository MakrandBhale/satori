from flask import Flask, jsonify, render_template, request, json
from scraper import scraper
from ml import preprocessor
from validator.ErrorClass import ErrorResponse
from validator import validator
import nltk
from rq import Queue
from redis import Redis

redis_conn = Redis()

try:
    nltk.download('punkt', download_dir='/opt/python/current/app')
    nltk.download('stopwords', download_dir='/opt/python/current/app')
except:
    nltk.download('punkt')
    nltk.download('stopwords')

app = Flask(__name__, template_folder="templates")
MONTH = 0


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', response='')


@app.route('/', methods=['POST'])
def scrape_data():
    search_json = validator.clean_response(request.get_json())

    if isinstance(search_json, ErrorResponse):
        return app.response_class(response=json.dumps(search_json.serialize()),
                                  status=search_json.code,
                                  mimetype='application/json')

    job_list = scraper.scrape(search_json['query'], search_json['startDate'], search_json['endDate'],
                              search_json['stepCount'], search_json['tweetFrequency'])

    # processed_tweets = preprocessor.analyze(tweets)
    # response = preprocessor.compile_result(processed_tweets)
    return app.response_class(response=json.dumps(job_list),
                              status=200,
                              mimetype='application/json')


@app.route('/tasks/<task_id>', methods=['POST'])
def get_status(task_id):
    q = Queue(connection=redis_conn)
    task = q.fetch_job(task_id)
    if task:
        res = ""
        if task.result is not None:
            processed_tweets = preprocessor.analyze(tweets=task.result)
            res = preprocessor.compile_result(processed_tweets)

        response_object = {
            "status": "success",
            "data": {
                "task_id": task.get_id(),
                "task_status": task.get_status(),
                "task_res": res
            },
        }
    else:
        response_object = {"status": "error"}
    return jsonify(response_object)


if __name__ == '__main__':
    app.run(debug=True)
