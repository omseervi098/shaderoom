import hmac
from http import HTTPStatus

import onnxruntime
from fastapi import Depends, File, Header, HTTPException, Request, UploadFile

from src.config import Settings, get_settings
from src.schemas import ImageFile


def validate_image_upload(
    settings: Settings = Depends(get_settings),
    image: UploadFile = File(...),
) -> ImageFile:
    if image.content_type is None or image.filename is None:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="No file uploaded",
        )

    if image.content_type not in settings.allowed_types:
        raise HTTPException(
            status_code=HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type",
        )

    if image.size and image.size > settings.max_input_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
            detail="File too large",
        )

    return ImageFile(
        data=image.file.read(),
        filename=image.filename,
        content_type=image.content_type,
    )


def get_model_session(request: Request) -> onnxruntime.InferenceSession:
    model_session = getattr(request.app.state, "model_session", None)
    if model_session is None:
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Model session not available",
        )
    return model_session


def verify_api_token(
    x_api_key: str = Header(...),
    settings: Settings = Depends(get_settings),
) -> None:
    if not hmac.compare_digest(x_api_key, settings.api_token):
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail="Invalid API token",
        )

