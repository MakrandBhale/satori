from pandas import DataFrame
import pandas as pd
from statsmodels.tsa.arima_model import ARIMA
from fbprophet import Prophet
import numpy as np
import math

STEPS = ['D', 'W', 'D', 'M']

DATE = 0
POSITIVE = 1
NEGATIVE = 2
NEUTRAL = 3
TOTAL = 4
FORMAT = '%Y-%m-%d'

def get_date_string(dic):
    return dic[0] + '-' + dic[1] + '-' + dic[2]


def initialise(document):
    stepCount = document['query']['stepCount']
    row_list = []
    for item in document['computed_res']['timeFragment']:
        split_date = item['name'].split('-')
        start_date = split_date[0:3]
        # end_date = split_date[3:6]
        row = [get_date_string(start_date), item['positive'], item['negative'],
               item['neutral'], item['total']]
        row_list.append(row)
    df = DataFrame(row_list, columns=['date', 'positive', 'negative', 'neutral', 'total'])
    return preprocess(df, stepCount)


def preprocess(df, stepCount):
    # df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d', errors='raise')
    # df = df.rename(columns={'date': 'ds'})
    # df = df.set_index('ds')
    print("original df")
    print(df.head())
    # return predict(df, 'neutral')
    try:
        return {
            'positive': prophet_predictor(df, 'positive', stepCount),
            'negative': prophet_predictor(df, 'negative', stepCount),
            'neutral': prophet_predictor(df, 'neutral', stepCount)
        }
    except:
        return None


def predict(df, sentiment):
    lag = math.ceil(df.shape[0] / 3)
    print(lag)
    model = ARIMA(df[sentiment], order=(lag, 0, 0))
    arima_fit = model.fit()
    prediction = arima_fit.forecast(steps=3)[0]
    print(sentiment, prediction)
    return prediction.tolist()


def prophet_predictor(original_df, sentiment, stepCount):
    df = original_df[['date', sentiment]].copy()

    print("selected df")
    print(df.head())
    print(df.dtypes)
    df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d', errors='raise')

    df = df.rename(columns={'date': 'ds',
                            sentiment: 'y'})
    # df.set_index(pd.DatetimeIndex(df['ds']), inplace=True, drop=True)
    # df.drop(['ds'], axis=1, inplace=True)
    # df.set_index('ds', inplace=True, drop=True)
    print("changed df")
    print(df.head())
    print(df.dtypes)

    model = Prophet(interval_width=0.95) 
    model.fit(df)
    future_dates = model.make_future_dataframe(periods=3, include_history=False, freq=STEPS[stepCount])
    forecast = model.predict(future_dates)
    forecast = forecast[['ds', 'yhat']]
    forecast['ds'] = forecast['ds'].values.astype(np.int64)

    print(forecast)
    return forecast.values.tolist()
