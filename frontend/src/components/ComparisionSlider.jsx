import { MoveHorizontal } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ComparisonSlider = ({ beforeImage, afterImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    const handleMove = useCallback(
        (clientX) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
                const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
                setSliderPosition(percent);
            }
        },
        []
    );

    const handleMouseMove = useCallback(
        (e) => {
            if (!isResizing) return;
            handleMove(e.clientX);
        },
        [isResizing, handleMove]
    );

    const handleTouchMove = useCallback(
        (e) => {
            if (!isResizing) return;
            handleMove(e.touches[0].clientX);
        },
        [isResizing, handleMove]
    );

    // Attach global event listeners to window to handle dragging outside the component
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp, handleTouchMove]);

    // Handle click to jump
    const handleContainerClick = (e) => {
        handleMove(e.clientX);
    };

    return (
        <div
            className="relative w-full h-full select-none rounded-xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onClick={handleContainerClick}
        >
            {/* After Image (Background) - Right Side */}
            <img
                src={afterImage}
                alt="After"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
            />

            {/* Label After */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none z-10 border border-white/10 shadow-lg">
                AFTER
            </div>

            {/* Before Image (Foreground) - Left Side - Clipped */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
                style={{
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                />

                {/* Label Before */}
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold z-10 border border-white/10 shadow-lg">
                    BEFORE
                </div>
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors hover:bg-slate-200"
                style={{ left: `${sliderPosition}%` }}
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

export default ComparisonSlider;