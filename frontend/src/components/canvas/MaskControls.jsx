import { Palette, X } from "lucide-react";
import React from "react";

const MaskControls = ({
    selectedMaskId,
    maskState,
    selectedShade,
    tileRepetition,
    setTileRepetition,
    isPerspectiveMode,
    togglePerspectiveMode,
    resetPerspective,
    handleApplySelectedShade,
    cycleBlendMode,
    removeShadeFromMask,
    currentBlendIndex,
    blendModes
}) => {
    if (!selectedMaskId) return null;

    return (
        <div className="absolute top-0 right-4 z-10 flex flex-col gap-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">

            {/* Texture Tiling Control */}
            {(selectedShade?.url || maskState.find(m => m.id === selectedMaskId)?.appliedShade?.type === 'texture') && (
                <div className="flex flex-col gap-1 mb-1">
                    <div className="flex flex-col items-center bg-gray-100 rounded p-1">
                        <span className="text-[10px] text-gray-600 font-bold">Tile: {tileRepetition}</span>
                        <input
                            type="range"
                            min="2"
                            max="10"
                            step="1"
                            value={tileRepetition}
                            onChange={(e) => setTileRepetition(parseInt(e.target.value))}
                            className="w-20 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <button
                        onClick={togglePerspectiveMode}
                        className={`w-full text-[10px] py-1 rounded font-bold transition-colors ${isPerspectiveMode ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {isPerspectiveMode ? 'Done' : 'Perspective'}
                    </button>
                    <button
                        onClick={resetPerspective}
                        className={`w-full text-[10px] py-1 rounded font-bold transition-colors ${isPerspectiveMode ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Apply Shade Button */}
            {selectedShade && (
                <div className="flex gap-1 items-center justify-evenly">
                    <button
                        onClick={handleApplySelectedShade}
                        className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        title="Apply selected shade to mask"
                    >
                        <Palette className="w-4 h-4" />
                    </button>
                    {/* Blend Mode Toggle */}
                    <button
                        onClick={cycleBlendMode}
                        className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title={`Blend mode: ${blendModes[currentBlendIndex].name}`}
                    >
                        {React.createElement(blendModes[currentBlendIndex].icon, { className: "w-4 h-4" })}
                    </button>

                    {/* Remove Shade */}
                    <button
                        onClick={() => removeShadeFromMask(selectedMaskId)}
                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Remove applied shade from mask"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MaskControls;
