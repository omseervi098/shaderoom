# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:22-slim AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
ENV VITE_APP_BACKEND_URI=""
RUN npm run build


FROM python:3.14-slim AS backend-deps
WORKDIR /app
COPY backend/pyproject.toml ./
RUN pip install --no-cache-dir uv \
    && uv venv /opt/venv \
    && uv pip install --python /opt/venv/bin/python --no-cache -r pyproject.toml


FROM python:3.14-slim

RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && pip uninstall -y pip \
    && rm -rf /usr/local/lib/python3*/ensurepip

ENV PATH=/opt/venv/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MODEL_PATH=models/sam_vit_h_encoder.onnx \
    STATIC_DIR=/app/static

WORKDIR /app

COPY --from=backend-deps /opt/venv /opt/venv
COPY backend/src ./src
COPY backend/models/sam_vit_h_encoder.onnx ./models/sam_vit_h_encoder.onnx
COPY --from=frontend /app/dist ./static

USER nobody
EXPOSE 8000

CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000"]
