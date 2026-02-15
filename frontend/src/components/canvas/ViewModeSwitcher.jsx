import { Eye, MousePointer2, SplitSquareHorizontal } from "lucide-react";

const ViewModeSwitcher = ({ viewMode, setViewMode }) => {
    return (
        <div className="absolute top-1/3 right-2 z-10 flex flex-col bg-white rounded-md shadow-md p-1 gap-1">
            {/* Sliding Background */}
            <div
                className="absolute w-8 h-8 bg-blue-100 rounded transition-all duration-300 ease-in-out"
                style={{
                    transform: `translateY(${viewMode === 'view' ? '0px' : viewMode === 'interact' ? '36px' : '72px'})`,
                    top: '4px',
                    left: '4px'
                }}
            />

            {/* View Mode Button */}
            <button
                onClick={() => setViewMode('view')}
                className={`relative z-10 w-8 h-8 flex items-center justify-center transition-colors group ${viewMode === 'view' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Eye size={18} />
                <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    View Mode
                </span>
            </button>

            {/* Interact Mode Button */}
            <button
                onClick={() => setViewMode('interact')}
                className={`relative z-10 w-8 h-8 flex items-center justify-center transition-colors group ${viewMode === 'interact' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <MousePointer2 size={18} />
                <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Interact Mode
                </span>
            </button>

            {/* Compare Mode Button */}
            <button
                onClick={() => setViewMode('compare')}
                className={`relative z-10 w-8 h-8 flex items-center justify-center transition-colors group ${viewMode === 'compare' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <SplitSquareHorizontal size={18} />
                <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Compare Mode
                </span>
            </button>
        </div>
    );
};

export default ViewModeSwitcher;
