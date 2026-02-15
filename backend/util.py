
import cv2
import numpy as np

from settings import get_settings
from logger import get_logger

class PreProcessor:
    def __init__(self, image: bytes) -> None:
        self._raw_img = image
        self._setting = get_settings()
        self.logger = get_logger(self.__class__.__name__)

        self._cv_img: cv2.typing.MatLike = self.read_image_bytes()

    def read_image_bytes(self) -> cv2.typing.MatLike:
        data = np.frombuffer(self._raw_img, dtype=np.uint8)
        cv_img = cv2.imdecode(data, cv2.IMREAD_UNCHANGED)
        if cv_img is None:
            raise ValueError("Failed to decode image bytes.")
        return cv_img
    
    def reduce_image_size(self) -> None:
        h, w = self._cv_img.shape[:2]
        self.logger.debug(f"Image Size: {w}x{h}")
        if max(w, h) > self._setting.max_dimension:
            scale = self._setting.max_dimension / max(w, h)
            new_w, new_h = int(w*scale), int(h*scale)
            self._cv_img = cv2.resize(self._cv_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
            self.logger.info(f"Resized image from {w}x{h} to {new_w}x{new_h}")

    def ensure_rgb_image(self) -> None:
        if self._cv_img.ndim == 2: # Convert grayscale to RGB
            self._cv_img = cv2.cvtColor(self._cv_img, cv2.COLOR_GRAY2RGB)
        elif self._cv_img.shape[2] == 4:  # Handle RGBA
            self._cv_img = cv2.cvtColor(self._cv_img, cv2.COLOR_RGBA2RGB)
        else:
            return None
    
    def affine_transform(self) -> None:
        scale_x = self._setting.input_img_res[1] / self._cv_img.shape[1]
        scale_y = self._setting.input_img_res[0] / self._cv_img.shape[0]
        scale = min(scale_x, scale_y)

        transform_mat = np.array([[scale, 0, 0], [0, scale, 0], [0, 0, 1]])
        self._cv_img = cv2.warpAffine(
            self._cv_img,
            transform_mat[:2],
            (self._setting.input_img_res[1], self._setting.input_img_res[0]),
            flags=cv2.INTER_LINEAR
        )
    
    def handle(self) -> np.typing.NDArray:
        try:
            self.ensure_rgb_image()
            self.reduce_image_size()
            self.affine_transform()
            return np.ascontiguousarray(self._cv_img.astype(np.float32))
        except Exception as e:
            self.logger.error(f"Image preprocessing failed: {str(e)}")
            raise e