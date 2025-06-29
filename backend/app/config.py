from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = "development"
    OPENAI_API_KEY: str
    OPENAI_API_KEY_OLD: str
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    POSTGRES_USER:str
    POSTGRES_PASSWORD:str
    POSTGRES_DB:str
    POSTGRES_HOST:str
    POSTGRES_PORT:str
    NEO4J_URI:str
    NEO4J_USER:str
    NEO4J_PASSWORD:str
    PUBMED_EMAIL: str
    PUBMED_TOOL: str
    PUBMED_API_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
