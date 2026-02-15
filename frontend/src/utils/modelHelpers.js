import { convertURLtoFile } from "./imageHelpers.js";
import axios from "axios";
import { Tensor } from "onnxruntime-web";

function f16ToF32(h) {
  const s = (h & 0x8000) >> 15;
  const e = (h & 0x7c00) >> 10;
  const f = h & 0x03ff;

  if (e === 0) return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
  if (e === 31) return f ? NaN : (s ? -Infinity : Infinity);
  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
}


export const getImageEmbedding = async (imageElement) => {
  if (!imageElement) return null;
  try {
    const imageFile = await convertURLtoFile(imageElement.src, "image.jpg");
    // float16 for low network
    let float16flag = ["3g", "2g", "4g"].includes(navigator.connection.effectiveType)
    let url = `${import.meta.env.VITE_APP_BACKEND_URI}/get-embedding?tensorType=${float16flag?"float16":"float32"}&__sign=${import.meta.env.VITE_APP_BACKEND_TOKEN}`;

    if (import.meta.env.MODE === "development") {
      url = `${import.meta.env.VITE_APP_BACKEND_URI}/get-embedding?tensorType=${float16flag?"float16":"float32"}`;
      console.log("Development mode: Using local backend URI", url);
    }

    const response = await axios.post(
      url,
      {
        image: imageFile,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": import.meta.env.VITE_APP_BACKEND_KEY
        },
        responseType: "arraybuffer"
      }
    );
    const shape = response.headers["x-tensor-shape"].split(",").map(Number);
    const dtype = response.headers["x-tensor-dtype"];
    let float32Array;
    if (dtype === "float32") {
      float32Array = new Float32Array(response.data);
    } else if (dtype === "float16"){
      const u16 = new Uint16Array(response.data);
      float32Array = new Float32Array(u16.length);
      for (let i = 0; i < u16.length; i++) float32Array[i] = f16ToF32(u16[i]);
    }else{
      throw new Error(`Unexpected dtype: ${dtype}`)
    }
    return new Tensor("float32", float32Array, shape);
  } catch (err) {
    console.log("Error while fetching image embeddings:", err);
    throw err;
  }
};
export const transformDataForModel = ({
  clicks,
  embedding,
  modelScale,
  lastPredMask,
  mode,
}) => {
  const feeds = {
    image_embeddings: embedding,
    orig_im_size: new Tensor("float32", [modelScale.height, modelScale.width]),
  };

  // Check there are input click prompts
  if (clicks && clicks.length !== 0) {
    let pointCoords;
    let pointLabels;
    let pointCoordsTensor;
    let pointLabelsTensor;
    let n = clicks.length;

    if (mode === "lasso") {
      pointCoords = new Float32Array(2 * n);
      pointLabels = new Float32Array(n);
    } else {
      pointCoords = new Float32Array(2 * (n + 1));
      pointLabels = new Float32Array(n + 1);
    }

    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.modelScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.modelScale;
      pointLabels[i] = clicks[i].type;
    }

    if (mode === "lasso") {
      pointCoordsTensor = new Tensor("float32", pointCoords, [1, n, 2]);
      pointLabelsTensor = new Tensor("float32", pointLabels, [1, n]);
    } else {
      pointCoords[2 * n] = 0.0;
      pointCoords[2 * n + 1] = 0.0;
      pointLabels[n] = -1.0;
      pointCoordsTensor = new Tensor("float32", pointCoords, [1, n + 1, 2]);
      pointLabelsTensor = new Tensor("float32", pointLabels, [1, n + 1]);
    }
    feeds.point_coords = pointCoordsTensor;
    feeds.point_labels = pointLabelsTensor;
  }
  if (feeds.point_coords === undefined || feeds.point_labels === undefined)
    return;

  if (lastPredMask) {
    //last Pred Mask will be float32 array of 256*256 size
    feeds.mask_input = new Tensor("float32", lastPredMask, [1, 1, 256, 256]);
    feeds.has_mask_input = new Tensor("float32", [1], [1]);
  } else {
    feeds.mask_input = new Tensor(
      "float32",
      new Float32Array(256 * 256),
      [1, 1, 256, 256], // SAM expects this shape
    );
    feeds.has_mask_input = new Tensor("float32", [0], [1]);
  }

  return feeds;
};
