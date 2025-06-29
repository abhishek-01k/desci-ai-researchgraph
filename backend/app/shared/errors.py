from typing import Optional, Any


class AppError(Exception):
    """Base class for an App Error"""

    status_code: int
    message: str
    payload: Optional[Any]

    def __init__(
        self,
        message: str,
        status_code: int,
        payload: Optional[Any] = None,
    ):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        error_data = dict(self.payload or {})
        error_data["message"] = self.message
        error_data["status"] = "error"
        return error_data


class InternalAppError(AppError):
    """Internal Api Error"""

    message: str
    payload: Optional[Any]

    def __init__(
        self,
        message: str,
        payload: Optional[Any] = None,
        code: int = 500,
    ):
        super().__init__(message, code, payload)
