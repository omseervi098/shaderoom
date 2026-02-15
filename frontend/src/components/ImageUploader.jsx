import { useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import imageCompression from "browser-image-compression";
const ImageUploader = ({
  onUpload = (selectedFile) => {},
  acceptedFormats = ["image/jpeg", "image/png", "image/gif"],
  maxFileSizeInMB = 10 * 1024 * 1024, // 5 MB,
  showTitleandBorder = true,
}) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    if (!acceptedFormats.includes(selectedFile.type)) {
      setError("Invalid file format!");
      return false;
    }
    if (selectedFile.size / 1024 / 1024 > maxFileSizeInMB) {
      setError(`File size exceeds ${maxFileSizeInMB}MB limit!`);
      return false;
    }
    return true;
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!validateFile(selectedFile)) return;
    compressFile(selectedFile)
      .then((compressedFile) => {
        setFile(compressedFile);
        setUploadProgress(0);
        setUploaded(false);
        simulateUpload(compressedFile);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const compressFile = async (file) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1440,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options).then();
      return new File([compressedFile], file.name, {
        type: "image/jpeg",
        lastModified: compressedFile.lastModified,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (!validateFile(droppedFile)) return;
    compressFile(droppedFile)
      .then((compressedFile) => {
        setFile(compressedFile);
        setUploadProgress(0);
        setUploaded(false);
        simulateUpload(compressedFile);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const simulateUpload = (selectedFile) => {
    let progress = 0;
    // delay to simulate upload time
    const interval = setInterval(() => {
      if (progress < 100) {
        progress += 10;
        setUploadProgress(progress);
      } else {
        clearInterval(interval);
        setUploaded(true);
        onUpload(selectedFile);
      }
    }, 150);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploaded(false);
    setError("");
  };

  return (
    <div className="w-full mx-auto p-5 bg-white  rounded-2xl shadow-lg border border-primary flex flex-col items-center justify-center">
      {showTitleandBorder && (
        <h2 className="text-lg font-semibold text-center text-text-primary">
          Upload Your Image
        </h2>
      )}

      {/* Drag & Drop Area */}
      <div
        className={`mt-4 w-full flex flex-col items-center" +
            " justify-center border-2 border-dashed border-primary p-6 rounded-lg cursor-pointer bg-secondary hover:opacity-80 transition`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          id="fileInput"
          accept={acceptedFormats.join(",")}
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex flex-col items-center"
        >
          <UploadCloud className="w-10 h-10 text-primary" />
          <p className="mt-4 text-text-primary text-md">
            Drag & drop files or <span className="text-primary ">Browse</span>
          </p>
          <p className="text-xs text-text-primary  mt-1">
            Supported formats: JPEG, PNG, GIF
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {/* File Upload Progress */}
      {file && (
        <div className="w-full mt-4">
          <p className="text-sm text-text-secondary">
            {uploaded ? "Uploaded" : `Uploading ...`}
          </p>
          <div className="w-full flex items-center gap-3 mt-2 px-2 py-1 border border-primary rounded-lg bg-secondary ">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 w-[60%] overflow-clip">
              <p className="text-sm text-text-primary">
                {file.name.length > 22
                  ? file.name.slice(0, 22) + "..."
                  : file.name}
              </p>
              {!uploaded && (
                <div className="w-full bg-background h-1 rounded mt-1">
                  <div
                    className="h-1 bg-primary rounded"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {uploaded && (
                <p className="text-xs text-green-600 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            {uploaded && (
              <button
                onClick={removeFile}
                className="text-red-500 bg-white p-1 rounded-full cursor-pointer hover:bg-red-100 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
