from flask import Flask, jsonify, render_template, request
from scraper import scraper
from ml import preprocessor

app = Flask(__name__, template_folder="templates")
MONTH = 0


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', response='')


@app.route('/', methods=['POST'])
def scrape_data():
    query = request.form['query']
    tweets = scraper.scrape(query, MONTH)
    processed_tweets = preprocessor.analyze(tweets)
    response = preprocessor.compile_result(processed_tweets)
    return render_template('index.html', response=response)


if __name__ == '__main__':
    app.run(debug=True)
