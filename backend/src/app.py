from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.api.routes import router
from src.config import get_settings
from src.logging import get_logger
from src.services.encoder import get_encoder_session

logger = get_logger(__name__)


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code != 404:
                raise
            return await super().get_response("index.html", scope)


def create_app() -> FastAPI:
    settings = get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        try:
            app.state.model_session = get_encoder_session(settings)
            logger.info("ONNX model loaded successfully during startup.")
        except Exception:
            logger.exception("Failed to load ONNX model during startup.")
            raise

        yield

        if getattr(app.state, "model_session", None):
            app.state.model_session = None
            logger.info("ONNX model session cleared during shutdown.")

    app = FastAPI(
        title=settings.app_name,
        description=settings.description,
        version=settings.app_version,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["x-tensor-shape", "x-tensor-dtype"],
    )
    app.add_middleware(
        GZipMiddleware,
        minimum_size=1024,
        compresslevel=6,
    )
    app.router.routes.extend(router.routes)

    if settings.static_dir and Path(settings.static_dir).is_dir():
        app.mount("/", SPAStaticFiles(directory=settings.static_dir, html=True), name="frontend")
        logger.info("Serving frontend from %s", settings.static_dir)

    return app


app = create_app()
