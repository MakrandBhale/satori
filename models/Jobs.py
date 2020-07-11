class JobClass:

    def __init__(self, job_id):
        self.job_id = job_id
        self.job_status = None
        self.job_res = None

    def get_job_status(self):
        return self.job_status

    def get_job_res(self):
        return self.job_res

    def get_job_id(self):
        return self.job_id

    def set_job_res(self, job_res):
        self.job_id = job_res

    def set_job_status(self, job_status):
        self.job_status = job_status

    def serialize(self):
        return {
            "job_id": self.job_id,
            "job_status": self.job_status,
            "job_res": self.job_res
        }
