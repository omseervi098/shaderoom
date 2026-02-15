import { useEffect, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { CirclePlus, Minus } from "lucide-react";
export default function SelectColorsFromPalette({
  onUpdate = (selectedColors) => {},
}) {
  const [color, setColor] = useColor("#ABA2FF");
  const [selectedColors, setSelectedColors] = useState([]);
  const addColorToSelection = (color) => {
    if (!selectedColors.some((colorObj) => colorObj.hex === color.hex)) {
      setSelectedColors((prevColors) => [
        ...prevColors,
        {
          hex: color.hex,
          rgb: color.rgb,
        },
      ]);
    }
  };
  const removeColorFromSelection = (colorHex) => {
    setSelectedColors((prevColors) =>
      prevColors.filter((colorObj) => colorObj.hex !== colorHex),
    );
  };
  useEffect(() => {
    onUpdate(selectedColors);
  }, [selectedColors]);
  return (
    <div className="w-full flex flex-col sm:flex-row items-center sm:items-start justify-center p-3 gap-4">
      <div className="">
        {/* Color Picker */}
        <ColorPicker
          width={200}
          height={120}
          color={color}
          onChange={setColor}
          hideAlpha={true}
          hideInput={["hsv", "rgb"]}
        />
      </div>
      <div className="space-y-4">
        {/* HEX Input */}
        <div className="flex items-center  space-x-4">
          <div
            className="w-25 h-10 rounded-md shadow-md border border-primary"
            style={{ backgroundColor: color.hex }}
          ></div>
          <button
            onClick={() => addColorToSelection(color)}
            className="transition"
          >
            <CirclePlus className="w-auto text-primary" />
          </button>
        </div>

        {/* Selected Colors */}
        {selectedColors.length > 0 && (
          <div className="flex flex-col">
            <h4 className="text-center sm:text-start text-text-primary font-semibold">
              Selected Colors
            </h4>
            <div className="bg-secondary rounded-md flex justify-center">
              <div className="grid grid-cols-4 gap-2 rounded-md bg-secondary p-2">
                {selectedColors.map((colorObj, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer rounded-md border border-primary"
                    onClick={() => removeColorFromSelection(colorObj.hex)}
                  >
                    <div
                      className="w-10 h-10 rounded-md"
                      style={{ backgroundColor: colorObj.hex }}
                    ></div>
                    <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white bg-primary/70 p-1 rounded-full text-xs">
                        <Minus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
