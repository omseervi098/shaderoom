import { recommendedTextureList } from "../data/recommendedTexture.js";
import { useState, useMemo, useCallback, useEffect } from "react";
import { CircleMinus, CirclePlus } from "lucide-react";

export default function RecommendedTextures({
  onUpdate = (selectedTextures) => {},
}) {
  const [selectedTextures, setSelectedTextures] = useState([]);

  const selectedTextureIds = useMemo(
    () => new Set(selectedTextures.map((texture) => texture.id)),
    [selectedTextures],
  );

  const onAddTexture = useCallback(
    (texture) => {
      if (selectedTextureIds.has(texture.id)) {
        return;
      }
      setSelectedTextures((prevSelectedTextures) => [
        ...prevSelectedTextures,
        texture,
      ]);
    },
    [selectedTextureIds],
  );

  const onRemoveTexture = useCallback((textureId) => {
    setSelectedTextures((prevSelectedTextures) =>
      prevSelectedTextures.filter((textureObj) => textureObj.id !== textureId),
    );
  }, []);

  useEffect(() => {
    onUpdate(selectedTextures);
  }, [selectedTextures]);

  return (
    <div className="w-full h-[70vh] overflow-y-scroll ">
      <div className=" flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-5 p-2 sm:p-3">
          {recommendedTextureList.map((texture, index) => {
            const isSelected = selectedTextureIds.has(texture.id);
            return (
              <div
                className={`w-30 sm:w-50 relative ${
                  isSelected ? "border-2" + " border-primary p-0.5 sm:p-1" : ""
                } group shadow-md cursor-pointer rounded-md `}
                key={index}
              >
                <img
                  src={texture.url}
                  alt={"texture" + texture.id}
                  className=" h-full rounded-md"
                />
                <button
                  onClick={() =>
                    isSelected
                      ? onRemoveTexture(texture.id)
                      : onAddTexture(texture)
                  }
                  className={`absolute flex items-center justify-center inset-0  ${isSelected ? "" : "opacity-0 group-hover:opacity-100 transition-opacity"} rounded-md bg-text-secondary/50 text-xl font-bold cursor-pointer`}
                >
                  {isSelected ? (
                    <CircleMinus className="w-8 h-8 text-secondary  font-semibold" />
                  ) : (
                    <CirclePlus className="w-8 h-8 text-secondary font-semibold" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
