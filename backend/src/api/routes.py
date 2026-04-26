from http import HTTPStatus

import numpy as np
import onnxruntime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Limiter, Rate

from src.api.dependencies import get_model_session, validate_image_upload, verify_api_token
from src.config import get_settings
from src.logging import get_logger
from src.schemas import ImageFile
from src.services.preprocessing import ImagePreprocessor

settings = get_settings()
logger = get_logger(__name__)
router = APIRouter()

minute_limiter = Limiter(Rate(settings.rate_limit, interval=Duration.MINUTE))
second_limiter = Limiter(Rate(settings.rate_limit, interval=Duration.SECOND))


@router.get(
    "/health",
    dependencies=[
        Depends(RateLimiter(limiter=second_limiter)),
        Depends(get_model_session),
    ],
)
async def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "model": "available",
    }


@router.post(
    "/get-embedding",
    dependencies=[
        Depends(verify_api_token),
        Depends(RateLimiter(limiter=minute_limiter)),
    ],
)
def get_embedding(
    tensor_type: str = Query(default="float32", alias="tensorType", pattern="^float(16|32)$"),
    model_session: onnxruntime.InferenceSession = Depends(get_model_session),
    image: ImageFile = Depends(validate_image_upload),
) -> Response:
    try:
        logger.info("Received embedding request for %s", image.filename)
        processed_image = ImagePreprocessor(image.data).process()

        output = model_session.run(None, {"input_image": processed_image})
        if output is None or len(output) == 0:
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Model inference failed",
            )

        dtype = np.float32 if tensor_type == "float32" else np.float16
        tensor = np.asarray(output[0], dtype=dtype, order="C")
        logger.info("Computed tensor with shape %s and dtype %s", tensor.shape, tensor.dtype)

        return Response(
            content=tensor.tobytes(),
            media_type="application/octet-stream",
            headers={
                "x-tensor-shape": ",".join(map(str, tensor.shape)),
                "x-tensor-dtype": str(tensor.dtype),
            },
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error while computing image embedding")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

