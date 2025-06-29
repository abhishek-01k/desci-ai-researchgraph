import logging
import httpx

from app.shared.errors import InternalAppError

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)


class ExternalAPIClient:
    def __init__(self, base_url: str, headers: dict | None = None):
        self.base_url = base_url
        self.headers = headers or {}
        self.client = httpx.AsyncClient(timeout=30.0)  # Optional: reuse client

    def _get_url(self, endpoint: str) -> str:
        return f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"

    async def _handle_response(self, response: httpx.Response):
        try:
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            try:
                err_json = response.json()
                logger.error(
                    "HTTP error occurred: %s, Response JSON: %s",
                    e,
                    err_json,
                )

                raise InternalAppError(
                    err_json.get("message", "An unknown error occurred"),
                    code=response.status_code,
                    payload=err_json,
                ) from e
            except Exception:
                logger.error(
                    "HTTP Error: %s, Response Text: %s",
                    e,
                    response.text,
                )
                raise
        except ValueError as e:
            logger.error(
                "JSON Decode Error: %s, Response Text: %s",
                e,
                response.text,
            )
            raise

    async def _get(
        self,
        endpoint: str,
        params: dict | None = None,
        headers: dict | None = None,
    ):
        url = self._get_url(endpoint)
        merged_headers = {**self.headers, **(headers or {})}
        response = await self.client.get(
            url,
            params=params,
            headers=merged_headers,
        )
        return await self._handle_response(response)

    async def post(
        self,
        endpoint: str,
        data: dict | None = None,
        headers: dict | None = None,
    ):
        url = self._get_url(endpoint)
        merged_headers = {**self.headers, **(headers or {})}
        response = await self.client.post(
            url,
            json=data,
            headers=merged_headers,
        )
        return await self._handle_response(response)

    async def _put(
        self,
        endpoint: str,
        data: dict | None = None,
        headers: dict | None = None,
    ):
        url = self._get_url(endpoint)
        merged_headers = {**self.headers, **(headers or {})}
        response = await self.client.put(
            url,
            json=data,
            headers=merged_headers,
        )
        return await self._handle_response(response)

    async def _delete(
        self,
        endpoint: str,
        data: dict | None = None,
        headers: dict | None = None,
    ):
        url = self._get_url(endpoint)
        merged_headers = {**self.headers, **(headers or {})}
        response = await self.client.delete(
            url,
            params=data,
            headers=merged_headers,
        )
        return await self._handle_response(response)

    async def close(self):
        await self.client.aclose()
