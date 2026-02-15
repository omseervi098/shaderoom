import { Check, RotateCcw, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";

const ZoomControls = ({
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    MAX_ZOOM,
    MIN_ZOOM,
    selectedMaskId,
    removeMask,
    setSelectedMaskId,
    setMode,
    mode,
    viewMode,
    showActionControls,
    actionRef,
    handleConfirm,
    handleUndo,
    handleReset
}) => {
    return (
        <div className="hidden md:absolute bottom-0 right-4 z-10 md:flex  gap-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg items-center">
            {selectedMaskId && (
                <>
                    {viewMode === 'interact' && (
                        <button onClick={() => {
                            removeMask(selectedMaskId);
                            setSelectedMaskId(null);
                            setMode(mode.replace("pan-", ""));
                        }} className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Delete Mask">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    <button onClick={() => {
                        setSelectedMaskId(null);
                        setMode(mode.replace("pan-", ""));
                    }} className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors" title="Deselect Mask"><X className="w-4 h-4" /></button>
                </>
            )}
            <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={resetZoom} className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs" title="Reset Zoom">1:1</button>
            <div className="text-xs text-center text-gray-600 font-mono">{Math.round(zoom * 100)}%</div>

            {showActionControls && (
                <>
                    {actionRef.current.confirm && (
                        <button onClick={handleConfirm} className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Confirm Mask"><Check className="w-4 h-4" /></button>
                    )}
                    {actionRef.current.undo && (
                        <button onClick={handleUndo} className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" title="Undo Last Click"><RotateCcw className="w-4 h-4" /></button>
                    )}
                    {actionRef.current.reset && (
                        <button onClick={handleReset} className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Reset Clicks"><X className="w-4 h-4" /></button>
                    )}
                </>
            )}

        </div>
    );
};

export default ZoomControls;
