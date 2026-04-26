import logging

from src.config import get_settings


def setup_logging(level: str | None = None, log_format: str | None = None) -> None:
    root = logging.getLogger()
    if root.handlers:
        return

    settings = get_settings()
    logging.basicConfig(
        level=level or settings.log_level,
        format=log_format or settings.log_format,
        handlers=[logging.StreamHandler()],
    )


def get_logger(name: str | None = None) -> logging.Logger:
    setup_logging()
    return logging.getLogger(name or "root")

