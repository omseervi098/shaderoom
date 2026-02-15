import {
  SwatchBook,
  PaintRoller,
  Crop,
  PaintBucket,
  Palette,
} from "lucide-react";
import RecommendedColorsThumbnail from "../../assets/select_shades_recommended_colors.png";
import RecommendedTexturesThumbnail from "../../assets/select_shades_recommended_textures.png";
import SelectFromColorPalette from "../../assets/select_shades_select_from_color_palette.png";
import UploadOwnTexture from "../../assets/select_shades_upload_own_texture.png";
import ExtractColorsFromImage from "../../assets/select_shades_extract_colors_from_image.png";
import { useGeneral } from "../../hooks/general/generalContext.js";
import ImageUploader from "../ImageUploader.jsx";
import ImageCropper from "../ImageCropper.jsx";
import { useEditor } from "../../hooks/editor/editorContext.js";
import ImageColorsExtractor from "../ImageColorsExtractor.jsx";
import SelectColorsFromPalette from "../selectFromPalette.jsx";
import RecommendedColors from "../RecommendedColors.jsx";
import RecommendedTextures from "../RecommendedTextures.jsx";
import ViewShades from "../ViewShades.jsx";
export default function SelectShades() {
  const { openModal, closeModal } = useGeneral();
  const { addTextures, shades, addColors } = useEditor();
  const handleTextureUpload = (textureFile) => {
    // Handle the uploaded texture file here
    let croppedTexture = null;
    openModal({
      title: {
        header: "Rotate or Crop Your Texture",
        subHeader: "Crop your texture to maintain 1:1 aspect ratio.",
        icon: <Crop className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <ImageCropper
          imageSrc={URL.createObjectURL(textureFile)}
          aspect={1}
          onCropComplete={(image) => {
            croppedTexture = image;
          }}
        />
      ),
      action: [
        {
          label: "Crop & Confirm",
          onClick: () => {
            if (croppedTexture) {
              addTextures([
                {
                  id: 1231,
                  url: croppedTexture,
                },
              ]);
              closeModal();
            } else {
              console.error("cropped image not found");
            }
          },
        },
      ],
    });
  };
  const onClickUploadTexture = () => {
    openModal({
      title: {
        header: "Upload your own Texture",
        subHeader:
          "Ensure your texture tile is high-quality for the best results.",
        icon: <PaintRoller className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <ImageUploader
          maxFileSizeInMB={2}
          acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
          onUpload={handleTextureUpload}
          showTitleandBorder={false}
        />
      ),
    });
  };
  const handleExtractColorsFromImage = (imageFile) => {
    let selectedColorsFromImage = [];
    openModal({
      title: {
        header: "Extract Colors from Image",
        subHeader: "Choose from the colors extracted from the image",
        icon: <PaintBucket className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <ImageColorsExtractor
          imageSrc={URL.createObjectURL(imageFile)}
          onUpdate={(selectedColors) => {
            selectedColorsFromImage = selectedColors;
          }}
        />
      ),
      action: [
        {
          label: "Confirm",
          onClick: () => {
            addColors(selectedColorsFromImage);
            closeModal();
          },
        },
      ],
      allowFlexibleWidth: true,
    });
  };
  const onClickExtractColorsFromImage = () => {
    openModal({
      title: {
        header: "Upload Image to Extract Colors",
        subHeader: "Ensure your Image have best quality for the best results.",
        icon: <PaintRoller className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <ImageUploader
          maxFileSizeInMB={2}
          acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
          onUpload={handleExtractColorsFromImage}
          showTitleandBorder={false}
        />
      ),
    });
  };
  const onClickSelectColorsFromPalette = () => {
    let selectedColorsFromPalette = [];
    openModal({
      title: {
        header: "Choose Colors from Palette",
        subHeader: "Add colors from color palette",
        icon: <Palette className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <SelectColorsFromPalette
          onUpdate={(selectedColors) => {
            selectedColorsFromPalette = selectedColors;
          }}
        />
      ),
      action: [
        {
          label: "Confirm",
          onClick: () => {
            addColors(selectedColorsFromPalette);
            closeModal();
          },
        },
      ],
      allowFlexibleWidth: true,
    });
  };
  const onClickRecommendedColors = () => {
    let selectedTilesFromRecommended = [];
    openModal({
      title: {
        header: "Recommended Colors",
        subHeader: "Choose from our suggested color sets",
        icon: <SwatchBook className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <RecommendedColors
          onUpdate={(selectedTiles) => {
            selectedTilesFromRecommended = selectedTiles;
          }}
        />
      ),
      action: [
        {
          label: "Confirm",
          onClick: () => {
            // get all colors from tiles
            const colorsList = selectedTilesFromRecommended
              .map((tile) => tile.colors)
              .flat();
            addColors(colorsList);
            closeModal();
          },
        },
      ],
      allowFlexibleWidth: true,
    });
  };
  const onClickRecommendedTextures = () => {
    let selectedTexturesFromRecommended = [];
    openModal({
      title: {
        header: "Recommended Textures",
        subHeader: "Chose from our suggested textures",
        icon: <SwatchBook className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <RecommendedTextures
          onUpdate={(selectedTextures) => {
            selectedTexturesFromRecommended = selectedTextures;
          }}
        />
      ),
      action: [
        {
          label: "Confirm",
          onClick: async () => {
            await addTextures(selectedTexturesFromRecommended);
            closeModal();
          },
        },
      ],
      allowFlexibleWidth: true,
    });
  };
  const onClickViewShades = () => {
    openModal({
      title: {
        header: "All Shades",
        subHeader: "selected shades colors and textures both",
        icon: <SwatchBook className="w-5 h-5" />,
        allowClose: true,
      },
      content: <ViewShades />,
      allowFlexibleWidth: true,
    });
  };
  return (
    <div className="flex flex-col justify-center w-full px-3 md:px-5  py-2 md:py-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-primary font-bold">
          Select Shades for Room
        </h1>
        <button
          className="mr-2 text-sm font-bold flex items-center relative cursor-pointer"
          onClick={onClickViewShades}
        >
          <SwatchBook className="w-8 h-8 text-primary bg-secondary rounded p-1" />
          <span className="absolute -top-1 -right-2 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {shades.textures.length + shades.colors.length}
          </span>
        </button>
      </div>
      <div className="flex flex-col justify-center mt-3 px-2 md:px-5">
        <h2 className="text-lg text-text-primary font-semibold">
          Select Color Shades
        </h2>
        <div className="md:px-10 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-10 mt-3">
          <div
            className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer"
            onClick={onClickExtractColorsFromImage}
          >
            <img
              src={`${ExtractColorsFromImage}`}
              alt="Extract Colors"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Extract Colors from Image
            </p>
          </div>
          <div
            className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer"
            onClick={onClickSelectColorsFromPalette}
          >
            <img
              src={`${SelectFromColorPalette}`}
              alt="Select from Color Palette"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Select from Color Palette
            </p>
          </div>
          <div
            className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer"
            onClick={onClickRecommendedColors}
          >
            <img
              src={`${RecommendedColorsThumbnail}`}
              alt="Recommended Colors"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm  font-semibold text-primary py-1">
              Recommended Colors
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center mt-3 px-2 md:px-5">
        <h2 className="text-lg text-text-primary font-semibold">
          Select Texture Shades
        </h2>
        <div className="md:px-10 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-10 mt-3">
          <div
            className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer"
            onClick={onClickRecommendedTextures}
          >
            <img
              src={`${RecommendedTexturesThumbnail}`}
              alt="Recommended Textures"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Recommended Textures
            </p>
          </div>
          <div
            className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer"
            onClick={onClickUploadTexture}
          >
            <img
              src={`${UploadOwnTexture}`}
              alt="Upload Own Texture"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Upload Own Texture
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
