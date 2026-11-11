"""Domain errors. Services raise these; main.py turns them into JSON responses
shaped like {"error": {"code": "...", "message": "..."}}."""


class AppError(Exception):
    status_code = 400

    def __init__(self, code: str, message: str, status_code: int | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        if status_code is not None:
            self.status_code = status_code


class NotFound(AppError):
    status_code = 404

    def __init__(self, what: str):
        super().__init__("not_found", f"{what} not found")


class Conflict(AppError):
    status_code = 409

