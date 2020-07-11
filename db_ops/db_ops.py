from bson.objectid import ObjectId
from pymongo import MongoClient


class DbOps:
    data_collection = None

    def __init__(self, mongo_uri):
        client = MongoClient(mongo_uri)
        database = client.satori
        self.data_collection = database.data

    def create_new_document(self, key, value):
        return str(self.data_collection.insert({key: value}))

    def read_from_db(self, key):
        return self.data_collection.find_one({"_id": ObjectId(key)})

    def update(self, did, key, value):
        self.data_collection.update({"_id": ObjectId(did)}, {'$set': {key: value}})

    def get_job_list(self, key):
        res = self.data_collection.find_one({"_id": ObjectId(key)})
        return res
    # def add_to_array(self, did, key, value):
    #     self.data_collection.update({"_id": ObjectId(did)}, {'$push': {key: value}})
