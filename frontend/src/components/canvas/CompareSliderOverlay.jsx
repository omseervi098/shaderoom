import { MoveHorizontal } from "lucide-react";

const CompareSliderOverlay = ({ viewMode, sliderPosition, setIsResizing, isResizing }) => {
    if (viewMode !== 'compare') return null;

    return (
        <div
            className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden rounded-lg"
        >
            {/* Label After (Right) */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none z-10 border border-white/10 shadow-lg">
                AFTER
            </div>

            {/* Label Before (Left) */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none z-10 border border-white/10 shadow-lg">
                BEFORE
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors hover:bg-slate-200 pointer-events-auto"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={() => setIsResizing(true)}
                onTouchStart={() => setIsResizing(true)}
            >
                {/* Slider Handle (Circle) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center cursor-ew-resize transform transition-transform hover:scale-110 active:scale-95 group">
                    <MoveHorizontal className={`w-5 h-5 text-slate-800 ${isResizing ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                </div>

                {/* Vertical Hint Lines on Handle */}
                <div className="absolute top-[calc(50%-24px)] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-white/80 rounded-full"></div>
                <div className="absolute bottom-[calc(50%-24px)] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-white/80 rounded-full"></div>
            </div>
        </div>
    );
};

export default CompareSliderOverlay;
