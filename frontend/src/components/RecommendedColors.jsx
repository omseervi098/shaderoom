import { useCallback, useMemo, useState, useEffect } from "react";
import { recommendedColorsList } from "../data/recommendedColors.js";
import { CircleMinus, CirclePlus } from "lucide-react";

export default function RecommendedColors({
  onUpdate = (selectedTiles) => {},
}) {
  const [selectedTiles, setSelectedTiles] = useState([]);

  const selectedTileIds = useMemo(
    () => new Set(selectedTiles.map((tile) => tile.id)),
    [selectedTiles],
  );

  const onAddTile = useCallback(
    (tile) => {
      if (selectedTileIds.has(tile.id)) return;
      setSelectedTiles((prevSelectedTiles) => [...prevSelectedTiles, tile]);
    },
    [selectedTileIds],
  );

  const onRemoveTile = useCallback((tileId) => {
    setSelectedTiles((prevColors) =>
      prevColors.filter((colorObj) => colorObj.id !== tileId),
    );
  }, []);

  useEffect(() => {
    onUpdate(selectedTiles);
  }, [selectedTiles]);

  return (
    <div className="w-full sm:w-[70vw] h-[70vh] overflow-y-scroll p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
        {recommendedColorsList.map((tile) => {
          const isSelected = selectedTileIds.has(tile.id);
          return (
            <div
              key={tile.id}
              className={`relative ${isSelected ? "border-3 border-primary p-1" : ""} group shadow-md cursor-pointer rounded-md `}
            >
              <div
                className={`flex ${isSelected ? "h-9" : "h-13"} rounded-md overflow-hidden`}
              >
                {tile.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-[25%] h-full  hover:w-[40%] transition-all duration-200 transform hover:scale-100"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                ))}
              </div>
              <button
                onClick={() =>
                  isSelected ? onRemoveTile(tile.id) : onAddTile(tile)
                }
                className={`absolute -top-3 -right-3 flex items-center justify-center ${isSelected ? "" : "opacity-0 group-hover:opacity-100 transition-opacity"} text-white bg-secondary rounded-full text-xl font-bold cursor-pointer`}
              >
                {isSelected ? (
                  <CircleMinus className="w-8 h-8 text-primary  font-semibold" />
                ) : (
                  <CirclePlus className="w-8 h-8 text-primary font-semibold" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
