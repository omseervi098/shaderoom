import { useEditor } from "../hooks/editor/editorContext.js";
import { CircleMinus, Minus } from "lucide-react";
export default function ViewShades() {
  const { shades, removeTexture, removeColor } = useEditor();
  return (
    <div className="w-full flex flex-col max-h-[70vh] overflow-y-auto sm:p-2 gap-2">
      <div className="flex flex-col">
        <h3 className="text-center sm:text-start text-text-primary font-semibold">
          Selected Colors:
        </h3>
        <div className="w-full sm:w-auto bg-secondary p-2 rounded-md flex justify-center">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 mt-2 rounded-md bg-secondary sm:p-2">
            {shades.colors.map((color, index) => (
              <div
                key={index}
                className="relative group cursor-pointer border rounded-md "
                onClick={() => removeColor(color)}
              >
                <div
                  className="h-15 w-15 rounded-md"
                  style={{ backgroundColor: color.hex }}
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
      <div className="w-full flex flex-col">
        <h3 className="text-center sm:text-start text-text-primary font-semibold ">
          Selected Textures:
        </h3>
        <div className="w-full sm:w-auto bg-secondary p-2 rounded-md flex justify-center">
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 mt-2 rounded-md bg-secondary sm:p-2">
            {shades.textures.map((texture, index) => (
              <div
                className={`w-20 relative group shadow-md cursor-pointer rounded-md `}
                key={index}
              >
                <img
                  src={texture.url}
                  alt={"texture" + texture.id}
                  className=" h-full rounded-md"
                />
                <button
                  onClick={() => removeTexture(texture)}
                  className={`absolute flex items-center justify-center inset-0  opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-text-secondary/50 text-xl font-bold cursor-pointer`}
                >
                  <CircleMinus className="w-8 h-8 text-secondary  font-semibold" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
