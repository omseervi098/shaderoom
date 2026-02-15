import React, { useMemo } from "react";
import { getBoundaryFromImageData, getSolidMaskRows } from "../../utils/modesHelper.js";
import AppliedShadeLayer from "./AppliedShadeLayer.jsx";
import MaskShape from "./MaskShape.jsx";

const MaskItem = React.memo(({ maskData, dimensions, scale, isSelected, isHovered, onClick }) => {
    const { mask, id, appliedShade } = maskData;

    // Memoize expensive calculations
    const solidRows = useMemo(() => {
        return getSolidMaskRows(mask.imageData);
    }, [mask.imageData]);

    const boundaryCoords = useMemo(() => {
        return getBoundaryFromImageData(mask.imageData);
    }, [mask.imageData]);

    return (
        <>
            {/* Render Shade if it exists */}
            {appliedShade && (
                <AppliedShadeLayer
                    mask={mask}
                    appliedShade={appliedShade}
                    perspectivePoints={maskData.perspectivePoints}
                    dimensions={dimensions}
                    scale={scale}
                    solidRows={solidRows}
                />
            )}

            {/* Render Mask Outline/Fill */}
            <MaskShape
                mask={mask}
                id={id}
                dimensions={dimensions}
                scale={scale}
                isSelected={isSelected}
                isHovered={isHovered}
                maskColor={mask.maskColor}
                solidRows={solidRows}
                boundaryCoords={boundaryCoords}
                onClick={onClick}
            />
        </>
    );
});

export default MaskItem;
