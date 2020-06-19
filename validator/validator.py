import json
from validator.ErrorClass import ErrorResponse
from datetime import datetime, timedelta

DATE_FORMAT = "%Y-%m-%d"
DEFAULT_TWEET_FREQUENCY = 10


def json_validator(data):
    try:
        json.loads(data)
        return True
    except ValueError as error:
        print("invalid json: %s" % error)
        return False


def clean_response(response_json):
    if response_json['query'].isspace():
        return ErrorResponse(400, "Empty query")
    elif len(response_json['query']) > 450:
        # too long search keyword
        return ErrorResponse(400, "Query too long")
    elif len(response_json['query']) <= 2:
        return ErrorResponse(400, "Query too short")

    if response_json['startDate'] == "":
        response_json['startDate'] = get_default_start_date()

    if response_json['endDate'] == "":
        response_json['endDate'] = get_default_endDate()

    # dates are not empty
    if validate(response_json['startDate']):
        return ErrorResponse(400, "Incorrect start date format, should be YYYY-MM-DD")

    if validate(response_json['endDate']):
        return ErrorResponse(400, "Incorrect end date format, should be YYYY-MM-DD")

    if is_bigger(response_json['startDate'], response_json['endDate']):
        return ErrorResponse(422, "Start date can not be greater than end date. Please try again.")

    if len(response_json['stepCount']) >= 2:
        return ErrorResponse(400, "Invalid step size")
    elif response_json['stepCount'].isspace() or response_json['stepCount'] == "":
        return ErrorResponse(400, "Invalid step size")
    else:
        try:
            temp = int(response_json['stepCount'])
            if temp < 0:
                return ErrorResponse(400, "Invalid step size")
            response_json['stepCount'] = temp
        except ValueError:
            return ErrorResponse(400, "Invalid step size")

    if response_json['tweetFrequency'].isspace() or response_json['tweetFrequency'] == "":
        response_json['tweetFrequency'] = DEFAULT_TWEET_FREQUENCY

    else:
        try:
            response_json['tweetFrequency'] = int(response_json['tweetFrequency'])
            if response_json['tweetFrequency'] <= 0:
                return ErrorResponse(400, "Tweet frequency too small")
        except ValueError:
            return ErrorResponse(400, "Invalid tweet frequency count")

    return response_json


def validate(date_text):
    try:
        datetime.strptime(date_text, DATE_FORMAT)
    except ValueError:
        return False


def get_default_start_date():
    start_date = datetime.today() - timedelta(days=30)
    return start_date.strftime(DATE_FORMAT)


def get_default_endDate():
    return datetime.today().strftime(DATE_FORMAT)


def is_bigger(startDate, endDate):
    return datetime.strptime(startDate, DATE_FORMAT) > datetime.strptime(endDate, DATE_FORMAT)
