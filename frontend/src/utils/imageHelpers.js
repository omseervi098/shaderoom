import {  getBounds } from "./modesHelper";

export const scaleImage = (imageElement) => {
  const LONG_SIDE_LENGTH = 1024;
  let w = imageElement.naturalWidth;
  let h = imageElement.naturalHeight;
  const modelScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return { height: h, width: w, modelScale };
};
export const getImageElementFromBlob = (imageURI) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageURI;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
  });
};

export const convertURLtoFile = async (url, filename) => {
  // convert image url to image file
  return fetch(url)
    .then(function (res) {
      return res.blob();
    })
    .then(function (blob) {
      return new File([blob], filename, { type: "image/jpeg" });
    });
};

export const arrayToImageData = ({input, width, height, maskColor}) => {
  const [r, g, b, a] = maskColor;
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    if (input[i] > 0.0) {
      arr[4 * i] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, height, width);
};
export const imageDataToImage = (imageData) => {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
};

export const imageDataToCanvas = (imageData) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
};

export const onnxMaskToImage = ({input, width, height, maskColor}) => {
  const imageData = arrayToImageData({input, width, height, maskColor});
  return {
    imageData: imageData,
    bounds: getBounds(imageData),
    image: imageDataToImage(imageData),
    width: imageData.width,
    height: imageData.height,
    maskColor: maskColor
  }
};
