import logging
from settings import get_settings


def setup_logging(level: str|None = None, format: str|None=None):
    root = logging.getLogger()
    if root.handlers:
        return
    
    logging.basicConfig(
        level=level if level else get_settings().log_level ,
        format=format or get_settings().log_format,
        handlers=[logging.StreamHandler()]
    )

def get_logger(name: str|None = None) -> logging.Logger:
    setup_logging()
    return logging.getLogger(name or "root")