from functools import lru_cache
from logging import INFO
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from src.schemas import InferenceProvider

BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="forbid",
    )

    app_name: str = "ShadeRoom"
    app_version: str = "0.5.0"
    description: str = "Backend API for ShadeRoom"
    debug: bool = False
    api_prefix: str = "/api"
    log_level: str | int = Field(default=INFO, alias="LOG_LEVEL")
    log_format: str = Field(default="%(asctime)s - %(levelname)s - %(name)s - %(message)s", alias="LOG_FORMAT")
    model_path: str = Field(..., alias="MODEL_PATH")
    rate_limit: int = Field(default=5, alias="RATE_LIMIT_PER_MINUTE")
    api_token: str = Field(..., alias="API_TOKEN")
    cors_origins: list[str] = Field(default=["*"], alias="CORS_ORIGINS")

    input_img_res: tuple[int, int] = Field(default=(684, 1024), alias="INPUT_IMG_RES")
    max_dimension: int = Field(default=1500, alias="MAX_DIMENSION")
    max_input_size_mb: int = Field(default=10, alias="MAX_INPUT_SIZE_MB")
    allowed_types: tuple[str, ...] = Field(default=("image/jpeg", "image/png", "image/webp"), alias="ALLOWED_TYPES")
    inference_providers: InferenceProvider = Field(default=InferenceProvider.CPU, alias="INFERENCE_PROVIDER")
    intra_op_num_threads: int = Field(default=2, alias="NUM_OP_THREADS")


@lru_cache
def get_settings() -> Settings:
    return Settings()  
