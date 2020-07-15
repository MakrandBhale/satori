from bson.objectid import ObjectId
from pymongo import MongoClient


def array_to_obj_id(queryArray):
    objectIdArray = []
    for qid in queryArray:
        objectIdArray.append(ObjectId(qid))
    return objectIdArray


class DbOps:
    data_collection = None

    def __init__(self, mongo_uri):
        self.client = MongoClient(mongo_uri)
        database = self.client.satori
        self.data_collection = database.data

    def create_new_document(self, key, value):
        return str(self.data_collection.insert({key: value}))

    def read_from_db(self, did):
        return self.data_collection.find_one({"_id": ObjectId(did)})

    def get_value_by_key(self, did, key):
        return self.data_collection.find_one({"_id": ObjectId(did)}, {key: 1, '_id': 0})

    def update(self, did, key, value):
        self.data_collection.update({"_id": ObjectId(did)}, {'$set': {key: value}})

    def get_job_list(self, key):
        res = self.data_collection.find_one({"_id": ObjectId(key)})
        return res

    # def add_to_array(self, did, key, value):
    #     self.data_collection.update({"_id": ObjectId(did)}, {'$push': {key: value}})

    def get_jobs_status(self, key):
        return self.data_collection.find_one({"_id": ObjectId(key)}, {'jobs_status_array': 1})

    def get_queries_batch(self, queryArray):
        queryArray = array_to_obj_id(queryArray)
        res = []
        cursor = self.data_collection \
            .find({"_id": {"$in": queryArray}}, {'query': 1, 'query_status': 1, 'timestamp': 1, 'total_tweets': 1}) \
            .sort([("_id", -1)]) \
            .limit(10)
        for query in cursor:
            res.append(query)
        return res

    def close_connection(self):
        self.client.close()

    def get_old_queries_batch(self, lastQueryId, queryIdArray):
        res = []
        lastQueryIndex = queryIdArray.index(lastQueryId)
        nextIndex = lastQueryIndex + 1
        if nextIndex >= len(queryIdArray):
            return res
        nextQueryArray = array_to_obj_id(queryIdArray[nextIndex: nextIndex+5])

        cursor = self.data_collection \
            .find({"_id": {"$in": nextQueryArray}}, {'query': 1, 'query_status': 1, 'timestamp': 1}) \
            .sort([("_id", -1)]) \

        for query in cursor:
            res.append(query)
        return res
