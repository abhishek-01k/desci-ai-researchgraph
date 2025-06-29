import redis
import json
import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load credentials from environment variables
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")  # set this in .env

# Connect with authentication
r = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    decode_responses=True,  # returns strings instead of bytes
)


def get_cached_pubmed_result(claim: str):
    data = r.get(claim)
    return json.loads(str(data)) if data else None


def set_cached_pubmed_result(claim: str, result, ttl_seconds=86400):
    r.set(claim, json.dumps(result), ex=ttl_seconds)
