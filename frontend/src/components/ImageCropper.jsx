import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { RotateCcw, Save, ZoomIn, ZoomOut } from "lucide-react";
import { getCroppedImg } from "../utils/cropper.js";

export default function ImageCropper({
  imageSrc,
  cropSize,
  aspect,
  onCropComplete,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleCropComplete = useCallback(
    (croppedArea, croppedAreaPixels) => {
      getCroppedImg(imageSrc, croppedAreaPixels, rotation)
        .then((imageUri) => {
          onCropComplete(imageUri);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [imageSrc, onCropComplete, rotation],
  );

  return (
    <div className="relative w-full h-[300px] bg-gray-900 rounded-md overflow-hidden">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={aspect || 16 / 9}
        cropSize={cropSize}
        onCropChange={setCrop}
        onRotationChange={setRotation}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
        style={{ containerStyle: { width: "100%", height: "100%" } }}
      />
      <button
        onClick={() => setRotation((prev) => prev + 90)}
        className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-md hover:opacity-80 cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <button
        className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full shadow-md hover:opacity-80 cursor-pointer"
        onMouseDown={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <button
        className="absolute bottom-4 right-16 bg-primary text-white p-2 rounded-full shadow-md hover:opacity-80 cursor-pointer"
        onMouseDown={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
      >
        <ZoomOut className="w-5 h-5" />
      </button>
    </div>
  );
}
