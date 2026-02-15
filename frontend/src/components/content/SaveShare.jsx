import { useEffect, useState } from "react";
import { Download, Share2, Copy, RotateCcw, CopyCheck, SplitSquareHorizontal, MessageCircle, Twitter, Facebook, RefreshCcw } from "lucide-react";
import { useEditor } from "../../hooks/editor/editorContext";
import ComparisonSlider from "../ComparisionSlider";
import { useStepper } from "../../hooks/stepper/stepperContext";
import { useGeneral } from "../../hooks/general/generalContext";

export default function SaveShare() {
    const { image, finalImg } = useEditor();
    const { handlePrevious, handleReset } = useStepper();
    const [copied, setCopied] = useState(false);
    const [compare, setCompare] = useState(false);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = finalImg;
        link.download = `shaderoom-design-${Date.now()}.png`;
        link.click();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(finalImg);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const handleShare = async () => {
        if (navigator.share) {
            try {
                // Convert base64 to blob for sharing
                const response = await fetch(finalImg);
                const blob = await response.blob();
                const file = new File([blob], `shaderoom-${Date.now()}.png`, { type: 'image/png' });

                await navigator.share({
                    title: "ShadeRoom Design",
                    text: "Check out my room design!",
                    files: [file],
                });
            } catch (err) {
                console.log("Share cancelled or failed");
            }
        } else {
            //TODO: ADD FALLBACK WITH CUSTOM MODAL
        }
    };
    const toggleCompare = () => {
        setCompare(!compare);
    }
    return (
        <div className="w-full flex flex-col gap-8 p-8">
            <div className=" flex flex-col items-center gap-0">
                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-slate-900 max-h-128 max-w-3xl lg:h-128 lg:w-3xl md:h-96 md:w-xl sm:h-[90vh] sm:w-[90vw] h-[50vh] w-[90vw] object-contain">
                        {!compare ?

                            (<img src={finalImg} alt="final_img" className="w-full h-full object-contain" />)
                            : (<ComparisonSlider beforeImage={image.src} afterImage={finalImg} />)}
                    </div>
                    <div className="absolute right-2 top-2 flex flex-col gap-2 justify-center flex-wrap">

                        {/* Download Button */}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <Download size={18} />
                        </button>

                        {/* Copy Link Button */}
                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-3 py-2 font-semibold rounded-lg transition-all duration-200 ${copied
                                ? "bg-gray-300 text-gray-800"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                }`}
                        >
                            {!copied ? (<Copy size={18} />) : (<CopyCheck size={18} />)}
                        </button>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <Share2 size={18} />
                        </button>
                        {/* Compare Button */}
                        <button
                            onClick={toggleCompare}
                            className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <SplitSquareHorizontal size={18} />
                        </button>
                        {/* Edit Again Button */}
                        <button
                        onClick={handlePrevious}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
                    >
                        <RotateCcw size={18} />
                    </button>

                        {/* Start Over Button */}
                        <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-400 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <RefreshCcw size={18}/>
                    </button>
                    </div>
                </div>

            </div>
        </div>
    );
}