class SearchQuery:

    def __init__(self, query, startDate, endDate, stepSize, frequency):
        self.query = query
        self.startDate = startDate
        self.endDate = endDate
        self.stepSize = stepSize
        self.frequency = frequency

    def get_query(self):
        return self.query

    def get_startDate(self):
        return self.startDate

    def get_endDate(self):
        return self.endDate

    def get_stepSize(self):
        return self.stepSize

    def get_frequency(self):
        return self.frequency
