from flask import Flask, jsonify, render_template, request, json
from scraper import scraper
from ml import preprocessor
from validator.ErrorClass import ErrorResponse
from validator import validator
import nltk


try:
    nltk.download('punkt', download_dir='/opt/python/current/app')
    nltk.download('stopwords')
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

    tweets = scraper.scrape(search_json['query'], search_json['startDate'], search_json['endDate'],
                            search_json['stepCount'], search_json['tweetFrequency'])
    processed_tweets = preprocessor.analyze(tweets)
    response = preprocessor.compile_result(processed_tweets)
    return app.response_class(response=json.dumps(response),
                              status=200,
                              mimetype='application/json')


if __name__ == '__main__':
    app.run(debug=True)
