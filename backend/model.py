from typing import Literal
from enum import Enum
from pydantic import BaseModel

class InferenceProvider(Enum):
    CPU = "CPUExecutionProvider"
    GPU = "CUDAExecutionProvider"
    INTEL_GPU = "OpenVINOExecutionProvider"
    APPLE_GPU= "CoreMLExecutionProvider"

class ImageFile(BaseModel):
    data: bytes
    filename: str
    content_type: str