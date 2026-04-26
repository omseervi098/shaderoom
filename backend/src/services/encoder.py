import onnxruntime

from src.config import BACKEND_DIR, Settings
from src.logging import get_logger

logger = get_logger(__name__)


def get_encoder_session(settings: Settings) -> onnxruntime.InferenceSession:
    try:
        model_path = settings.model_path
        if not model_path.startswith("/"):
            model_path = str(BACKEND_DIR / model_path)

        session_options = onnxruntime.SessionOptions()
        session_options.intra_op_num_threads = settings.intra_op_num_threads
        model_session = onnxruntime.InferenceSession(
            model_path,
            providers=[settings.inference_providers.value],
            sess_options=session_options,
        )
        logger.info("Loaded ONNX model from %s", model_path)
    except Exception:
        logger.exception("Failed to load ONNX model")
        raise
    return model_session
