import {
  Droplet,
  Fullscreen,
  Grid,
  Lasso,
  Mouse,
  MousePointer,
  PenTool,
  RefreshCw,
  RotateCcw
} from "lucide-react";
import { useState } from "react";
import { useEditor } from "../hooks/editor/editorContext.js";

export default function Sidebar({ colors, textures }) {
  const { selectedShade, setSelectedShade, setMode, undoShade, resetShades } = useEditor();
  const [activeTab, setActiveTab] = useState(null);

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };
  // TODO : Make this sidebar collapsable 
  return (
    <div className="z-10 w-full flex h-full flex-col-reverse md:flex-row relative ">
      {/* Sidebar */}
      <div className="w-full h-16 md:h-auto md:w-16 lg:w-30 md:bg-primary text-primary flex md:flex-col items-center justify-center md:justify-start space-x-3 md:space-x-0 py-3 md:space-y-3 px-2">
        <button
          className="md:w-full bg-secondary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-secondary/70"
          onClick={enterFullscreen}
        >
          <Fullscreen size={24} />
          <span className="hidden lg:block font-semibold text-sm">Expand</span>
        </button>
        <button
          className="md:w-full bg-secondary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-secondary/70"
          onClick={() => toggleTab("textures")}
        >
          <Grid size={24} />
          <span className="hidden lg:block font-semibold text-sm">Texture</span>
        </button>
        <button
          className="md:w-full bg-secondary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-secondary/70"
          onClick={() => toggleTab("colors")}
        >
          <Droplet size={24} />
          <span className=" hidden lg:block font-semibold text-sm">Colors</span>
        </button>

        <button
          className="md:w-full bg-secondary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-secondary/70"
          onClick={() => resetShades()}
        >
          <RefreshCw size={22} />
          <span className="hidden lg:block font-semibold text-sm">Reset</span>
        </button>
        <button
          className="md:w-full bg-secondary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-secondary/70"
          onClick={() => undoShade()}
        >
          <RotateCcw size={22} />
          <span className="hidden lg:block font-semibold text-sm">Undo</span>
        </button>
        <button
          className="md:w-full bg-secondary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-secondary/70"
          onClick={() => toggleTab("modes")}
        >
          <Mouse size={22} />
          <span className="hidden lg:block font-semibold text-sm">Modes</span>
        </button>
        <div className="hidden w-10 md:w-full bg-secondary rounded-md  overflow-hidden md:flex items-center justify-center gap-2 h-10  ">
          {selectedShade ? (
            selectedShade.url ? (
              <img
                src={selectedShade.url}
                alt={`texture_${selectedShade.id}.jpg`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full object-cover"
                style={{ background: selectedShade.hex }}
              />
            )
          ) : (
            <span className="hidden lg:block font-semibold text-sm">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Panel next to sidebar */}
      {activeTab === "textures" && (
        <div
          className={`scrollbar-hide absolute md:left-16 lg:left-30 top-0 h-16 md:h-full rounded-r-md md:bg-secondary transition-transform duration-400 ${activeTab === "textures" ? "translate-x-0" : "-translate-x-full"} w-full md:w-16 lg:w-20 overflow-x-auto overflow-y-hidden md:overflow-x-hidden md:overflow-y-auto py-2 px-2 md:px-0`}
        >
          <div className="w-max mx-auto flex md:flex-col items-center space-x-2 md:space-x-0 md:space-y-1 ">
            {textures &&
              textures.length > 0 &&
              textures.map((texture, index) => (
                <div
                  key={index}
                  className="w-14 h-10 rounded-md bg-gray-500 overflow-hidden cursor-pointer hover:opacity-60"
                  onClick={() => setSelectedShade(texture)}
                >
                  <img
                    src={texture.url}
                    alt={`texture_${index}.jpg`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
          </div>
        </div>
      )}
      {activeTab === "colors" && (
        <div
          className={`scrollbar-hide absolute md:left-16 lg:left-30 top-0 h-16 md:h-full rounded-r-md md:bg-secondary transition-transform duration-400 ${activeTab === "colors" ? "translate-x-0" : "-translate-x-full"} w-full md:w-16 lg:w-20 overflow-x-auto overflow-y-hidden md:overflow-x-hidden md:overflow-y-auto py-2 px-2 md:px-0`}
        >
          <div className="w-max mx-auto flex md:flex-col items-center space-x-2 md:space-x-0 md:space-y-1 ">
            {colors &&
              colors.map((color, index) => {
                return (
                  <div
                    key={index}
                    className="min-w-14 h-10 rounded-md cursor-pointer border border-primary"
                    style={{ background: color.hex }}
                    onClick={() => setSelectedShade(color)}
                  />
                );
              })}
          </div>
        </div>
      )}
      {activeTab === "modes" && (
        <div
          className={`scrollbar-hide absolute md:left-16 lg:left-30 top-0 h-16 md:h-full rounded-r-md md:bg-secondary transition-transform duration-400 ${activeTab === "modes" ? "translate-x-0" : "-translate-x-full"} w-full md:w-16 lg:w-20 overflow-x-auto overflow-y-hidden md:overflow-x-hidden md:overflow-y-auto py-2 px-2 md:px-0`}
        >
          <div className="w-max mx-auto text-white flex md:flex-col items-center space-x-2 md:space-x-0 md:space-y-3 ">
            <button
              className="md:w-full bg-primary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-primary/50"
              onClick={() => setMode("hover")}
            >
              <MousePointer size={22} />
            </button>
            <button
              className="md:w-full bg-primary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-primary/70"
              onClick={() => setMode("polygon")}
            >
              <PenTool size={22} />
            </button>
            <button
              className="md:w-full bg-primary rounded-full lg:rounded-md p-2 flex items-center justify-evenly gap-2 cursor-pointer hover:bg-primary/70"
              onClick={() => setMode("lasso")}
            >
              <Lasso size={22} />
            </button>
          </div>
        </div>
      )}
      {/*{activeTab === "tools" && (*/}
      {/*  <div className="w-48 bg-gray-200 p-4">*/}
      {/*    <p className="font-bold">Tools</p>*/}
      {/*    <div className="flex space-x-2 mt-2">*/}
      {/*      <button className="bg-gray-400 p-2 rounded">*/}
      {/*        <RotateCcw size={16} />*/}
      {/*      </button>*/}
      {/*      <button className="bg-gray-400 p-2 rounded">*/}
      {/*        <RotateCw size={16} />*/}
      {/*      </button>*/}
      {/*      <button className="bg-red-400 p-2 rounded">Reset</button>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
}
