import cv2
import numpy as np

from src.config import get_settings
from src.logging import get_logger

logger = get_logger(__name__)


class ImagePreprocessor:
    def __init__(self, image: bytes) -> None:
        self._raw_image = image
        self._settings = get_settings()
        self._image: cv2.typing.MatLike = self._decode_image()

    def process(self) -> np.typing.NDArray:
        try:
            self._ensure_rgb()
            self._resize_if_needed()
            self._fit_to_model_input()
            return np.ascontiguousarray(self._image.astype(np.float32))
        except Exception:
            logger.exception("Image preprocessing failed")
            raise

    def _decode_image(self) -> cv2.typing.MatLike:
        data = np.frombuffer(self._raw_image, dtype=np.uint8)
        image = cv2.imdecode(data, cv2.IMREAD_UNCHANGED)
        if image is None:
            raise ValueError("Failed to decode image bytes.")
        return image

    def _resize_if_needed(self) -> None:
        height, width = self._image.shape[:2]
        logger.debug("Image size: %sx%s", width, height)

        largest_side = max(width, height)
        if largest_side <= self._settings.max_dimension:
            return

        scale = self._settings.max_dimension / largest_side
        new_width = int(width * scale)
        new_height = int(height * scale)
        self._image = cv2.resize(self._image, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
        logger.info("Resized image from %sx%s to %sx%s", width, height, new_width, new_height)

    def _ensure_rgb(self) -> None:
        if self._image.ndim == 2:
            self._image = cv2.cvtColor(self._image, cv2.COLOR_GRAY2RGB)
        elif self._image.shape[2] == 4:
            self._image = cv2.cvtColor(self._image, cv2.COLOR_BGRA2RGB)
        elif self._image.shape[2] == 3:
            self._image = cv2.cvtColor(self._image, cv2.COLOR_BGR2RGB)

    def _fit_to_model_input(self) -> None:
        target_height, target_width = self._settings.input_img_res
        scale_x = target_width / self._image.shape[1]
        scale_y = target_height / self._image.shape[0]
        scale = min(scale_x, scale_y)

        transform_matrix = np.array([[scale, 0, 0], [0, scale, 0]], dtype=np.float32)
        self._image = cv2.warpAffine(
            self._image,
            transform_matrix,
            (target_width, target_height),
            flags=cv2.INTER_LINEAR,
        )

