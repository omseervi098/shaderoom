from http import HTTPStatus
from contextlib import asynccontextmanager
import hmac
import onnxruntime
import numpy as np
from fastapi import FastAPI, HTTPException, File, Query, UploadFile, Depends, Response, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pyrate_limiter import Duration, Limiter, Rate
from fastapi_limiter.depends import RateLimiter
from model import  ImageFile
from settings import get_settings
from logger import get_logger
from util import PreProcessor

logger = get_logger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # preload the ONNX model during startup to reduce latency on first request
        app.state.model_session = await get_encoder_session()
        logger.info("ONNX model loaded successfully during startup.")
    except Exception as e:
        logger.error(f"Failed to load ONNX model during startup: {e}")
        raise e

    yield  # Application runs here

    # Cleanup code can be added here if needed (e.g., closing sessions)
    if app.state.model_session:
        app.state.model_session = None
        logger.info("ONNX model session cleared during shutdown.")


async def get_encoder_session() -> onnxruntime.InferenceSession:
    try:
        session_options = onnxruntime.SessionOptions()
        session_options.intra_op_num_threads = settings.intra_op_num_threads
        model_session = onnxruntime.InferenceSession(
            settings.model_path,
            providers=[settings.inference_providers.value],
            sess_options=session_options
        )

        logger.info(f"Loaded ONNX Model from : {settings.model_path}")
    except Exception as e:
        logger.error(f"Failed to load ONNX Model: {e}")
        raise e
    return model_session

app = FastAPI(
    title=settings.app_name,
    description=settings.description,
    version="0.5.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-tensor-shape", "x-tensor-dtype"]
)
app.add_middleware(
    GZipMiddleware,
    minimum_size=1024,
    compresslevel=6
)


def validate_image_upload(
    image: UploadFile = File(...),
) -> ImageFile:
    if image.content_type is None or image.filename is None:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST,
                            detail="No file uploaded")

    if image.content_type not in settings.allowed_types:
        raise HTTPException(
            status_code=HTTPStatus.UNSUPPORTED_MEDIA_TYPE, detail="Unsupported File Type")

    if image.size and image.size > settings.max_input_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=HTTPStatus.REQUEST_ENTITY_TOO_LARGE, detail="File too large")

    return ImageFile(
        data=image.file.read(),
        filename=image.filename,
        content_type=image.content_type
    )


def get_model_session() -> onnxruntime.InferenceSession:
    model_session = app.state.model_session
    if model_session is None:
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Model session not available")
    return model_session


def verify_api_token(x_api_key: str = Header(...)) -> None:
    if not hmac.compare_digest(x_api_key, settings.api_token):
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="Invalid API token")


@app.get("/health", dependencies=[
    Depends(RateLimiter(limiter=Limiter(Rate(settings.rate_limit, interval=Duration.SECOND)))),
    Depends(get_model_session)
])
async def health_check():
    return {
        "status": "healthy",
        "model": "available"
    }


@app.post("/get-embedding", dependencies=[
    Depends(verify_api_token),
    Depends(RateLimiter(limiter=Limiter(Rate(settings.rate_limit, interval=Duration.MINUTE))))
])
async def get_embedding(
    tensor_type:str = Query(default="float32", alias="tensorType"),
    model_session: onnxruntime.InferenceSession = Depends(get_model_session),
    image: ImageFile = Depends(validate_image_upload)
):
    try:
        logger.info(f"Recieved Request for {image.filename=}")
        preprocessor = PreProcessor(image.data)
        processed_image = preprocessor.handle()
        logger.info(f"Processed Image")
        encoder_inputs = {"input_image": processed_image}
        output = model_session.run(None, encoder_inputs)
        logger.info("Computed tensor")
        if output is None or len(output) == 0:
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Model inference failed")

        tensor = np.asarray(output[0], dtype=np.float32 if tensor_type == "float32" else np.float16, order="C")
        shape_header = ",".join(map(str, tensor.shape))
        dtype_header = str(tensor.dtype)
        return Response(
            content=tensor.tobytes(),
            media_type="application/octet-stream",
            headers={
                "x-tensor-shape": shape_header,
                "x-tensor-dtype": dtype_header,
            }
        )

    except Exception as e:
        logger.error(f"Error in get_embedding: {str(e)}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=str(e))
