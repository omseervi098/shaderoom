
# ShadeRoom Backend

Minimal FastAPI backend for computing image embeddings using an ONNX encoder.

Overview
- Preloads an ONNX encoder at startup and exposes an endpoint to compute image embeddings.
- Models are stored under `models/` and referenced via the `MODEL_PATH` environment variable.

Requirements
- Python >= 3.14
- See `pyproject.toml` for Python dependencies (FastAPI, onnxruntime, OpenCV, etc.).

Configuration
- Configure runtime values in the `.env` file (or environment):
	- `MODEL_PATH` — path to the ONNX model (e.g. `models/sam_vit_h_encoder.onnx`)
	- `API_TOKEN` — secret used for `x-api-key` header on protected endpoints
	- `CORS_ORIGINS` — list of allowed origins (e.g. `["*"]`)

Run (development)
- Install dependencies and run with Uvicorn:

```bash
# move to the backend directory
cd backend
# install dependencies (choose one)
uv sync
# or install from pyproject with your preferred tool
fastapi dev main.py
```

Docker
- A `Dockerfile` is included for containerized runs. Build and run with Docker as usual.

Endpoints
- `GET /health` — simple health check; rate-limited.
- `POST /get-embedding` — accepts a multipart file (`image`) and returns raw tensor bytes.
	- Protected: requires `x-api-key` header matching `API_TOKEN`.
	- Query: `tensorType` (e.g. `float32` or `float16`).
	- Response headers: `x-tensor-shape`, `x-tensor-dtype`.

Notes
- The app preloads the ONNX model during FastAPI startup (lifespan) to reduce first-request latency.
- This backend does not persist user images by default; upload to an external storage service if you need public image URLs.

