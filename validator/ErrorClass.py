class ErrorResponse:
    def __init__(self, code, message):
        self.message = message
        self.code = code

    def serialize(self):
        return {
            "message": self.message,
            "code": self.code
        }
