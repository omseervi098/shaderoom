import CanvasImage from "./CanvasImage.jsx";
import Sidebar from "./Sidebar.jsx";
import { useEditor } from "../hooks/editor/editorContext.js";
export function ImageEditor() {
  const { shades } = useEditor();
  return (
    <div className="w-full h-full md:h-[80vh] flex flex-col-reverse md:flex-row justify-between">
      {/*  SideBar */}
      <div className="h-32 md:h-auto">
        <Sidebar colors={shades.colors} textures={shades.textures} />
      </div>

      {/*  Main Image */}
      <div className="py-5 md:py-0  h-full flex-1 flex items-center justify-center ">
        <div className="w-[96%] sm:w-[90%] md:w-full h-full md:h-[85%] lg:h-[95%]">
          <CanvasImage />
        </div>
      </div>
    </div>
  );
}
