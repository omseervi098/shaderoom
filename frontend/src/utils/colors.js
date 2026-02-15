export const colorDifference = (color1, color2) => {
  const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
  const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2),
  );
};

export const extractColorsFromImage = async (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Avoid CORS issues for external images
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;
      const colorSet = new Set();
      const step = 20; // Optimize performance by skipping pixels
      const minDiff = 50; // Minimum color difference threshold (adjustable)

      for (let i = 0; i < imageData.length; i += step * 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const rgb = `rgb(${r},${g},${b})`;

        // Check if the color is sufficiently different from existing ones
        let isDistinct = true;
        for (let existingColor of colorSet) {
          if (colorDifference(existingColor, rgb) < minDiff) {
            isDistinct = false;
            break;
          }
        }

        if (isDistinct && !colorSet.has(rgb)) {
          colorSet.add(rgb);
        }

        if (colorSet.size >= 8) break; // Stop once we get 6 unique colors
      }

      resolve([...colorSet]); // Return extracted colors
    };

    img.onerror = (err) => reject(err);
  });
};

export const rgbToHex = (rgb) => {
  const rgbArr = rgb
    .match(/\d+/g)
    .map((x) => parseInt(x).toString(16).padStart(2, "0"));
  return `#${rgbArr.join("")}`;
};
export const hexToRgb = (hex) => {
  // Ensure the hex is a valid 6-character hex code
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    throw new Error("Invalid HEX color format");
  }
};
export const rgbStrToRgbaArray = (rgb, alpha = 1) => {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return null;
  const [r, g, b] = match.map(Number);
  return [r, g, b, alpha];
};
