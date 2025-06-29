import os
from app.shared.external_api_client import ExternalAPIClient
from dotenv import load_dotenv

load_dotenv()


class GoogleAdapter:
    def __init__(
        self,
        client: ExternalAPIClient,
        oauth_client: ExternalAPIClient,
        config: dict,
    ):
        self.client = client
        self.oauth_client = oauth_client
        self.config = config

        self.user_info_endpoint = "/oauth2/v3/userinfo"
        self.token_endpoint = "/token"

    async def get_google_user_info(self, access_token: str):
        headers = {"Authorization": f"Bearer {access_token}"}

        result = await self.client._get(
            endpoint=self.user_info_endpoint,
            headers=headers,
        )

        print(f"GOOGLE USER INFO {str(result)}")

        return result

    async def exchange_token(self, code: str):
        data = {
            "code": code,
            "client_id": self.config.get("GOOGLE_CLIENT_ID"),
            "client_secret": self.config.get("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": self.config.get("GOOGLE_REDIRECT_URI"),
            "grant_type": "authorization_code",
        }

        print(f"EXCHANGING TOKEN WITH DATA {str(data)}")

        tokens = await self.oauth_client.post(
            endpoint=self.token_endpoint,
            data=data,
        )

        print(f"TOKEN RESPONSE {str(tokens)}")

        return tokens


base_client = ExternalAPIClient(base_url="https://www.googleapis.com")
oauth_client = ExternalAPIClient(base_url="https://oauth2.googleapis.com")

google_adapter = GoogleAdapter(
    client=base_client,
    oauth_client=oauth_client,
    config={
        "GOOGLE_CLIENT_ID": os.getenv("GOOGLE_CLIENT_ID"),
        "GOOGLE_CLIENT_SECRET": os.getenv("GOOGLE_CLIENT_SECRET"),
        "GOOGLE_REDIRECT_URI": os.getenv("GOOGLE_REDIRECT_URI"),
    },
)
