# ShadeRoom

## Project Description and Purpose
ShadeRoom is an advanced web application that allows users to edit and manipulate room images using AI-powered segmentation. The application enables users to select specific areas of a room image and apply different colors or textures to them, making it easy to visualize interior design changes without physically altering the space.


## Features
- **AI-Powered Image Segmentation**: Utilizes the Segment Anything Model (SAM) to intelligently identify and select areas in room images
- **Multiple Selection Tools**:
  - Lasso tool for freeform selection
  - Polygon/Pen tool for precise manual selection
  - Hover mode for quick previews
- **Color and Texture Application**: Apply various colors and textures to selected areas
- **Responsive Design**: Works on both desktop and mobile devices
- **Real-time Preview**: See changes instantly as you edit
- **Multi-step Workflow**: Guided journey through the editing process
- **Image Processing**: Handles image compression and manipulation

## Architecture Overview
ShadeRoom is built using a modern React architecture with the following key components:

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Build tool for fast development and optimized production builds
- **React Router**: For navigation between pages
- **React Konva**: Canvas manipulation for image editing
- **Tailwind CSS**: For styling and responsive design

### State Management
- **Context API**: Multiple context providers for different aspects of the application:


### Project structure
- `frontend/` – React + Vite frontend (UI, canvas editing, in-browser ONNX models)
- `backend/` – FastAPI service for generating image embeddings and providing protected endpoints
- `public/` / `assets/` – static assets and pre-bundled ONNX decoder files

## Key features
- AI segmentation with SAM (Segment Anything Model) loaded in the browser
- Multiple selection modes: lasso, pen/polygon, hover
- Apply colors and textures with blend modes and perspective transforms
- Multi-step guided workflow with `StepperProvider`
- Export/share final image from the UI (download, copy link, native share)

## Frontend — quick start
1. Open a terminal and go to `frontend/`:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `frontend/` (example):

```env
VITE_APP_BACKEND_URI=http://localhost:8000
VITE_APP_BACKEND_KEY=<your-api-key>
VITE_APP_HOSTNAME=localhost
```

4. Start dev server:

```bash
npm run dev
```

5. Open the app at the port printed by Vite (usually `http://localhost:5173`).



## Backend — quick start
1. Create and activate a Python environment (example using uv):

```bash
cd backend
```

2. Install dependencies:

```bash
uv sync
```

3. Configure `.env` in `backend/` (example):

```env
MODEL_PATH=models/sam_vit_h_encoder.onnx
API_TOKEN=<your-api-key>
CORS_ORIGINS=["*"]
```

4. Run the server (development):

```bash
fastapi dev main.py
```

Endpoints:
- `GET /health` — health check (rate-limited)
- `POST /get-embedding` — upload an image (`multipart/form-data` `image`) to receive raw tensor bytes. Requires `x-api-key` header.

Notes:
- The backend preloads the ONNX encoder at startup to reduce inference latency.
- Ensure the `MODEL_PATH` points to a compatible ONNX model in `backend/models/`.

## Sharing images / public URLs
- The frontend can generate a data URL of the final image and use the Web Share API to share a blob (native share) when available.



## Acknowledgements
- Segment Anything Model (SAM)
- ONNX Runtime
- React Konva
