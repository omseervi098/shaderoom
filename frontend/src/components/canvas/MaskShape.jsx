import React from "react";
import { Group, Shape } from "react-konva";

const MaskShape = React.memo(({ mask, id, dimensions, scale, isSelected, isHovered, maskColor, solidRows, boundaryCoords, onClick }) => {
    return (
        <Group
            onClick={onClick}
            clipFunc={(ctx) => {
                const { width } = mask;
                const scaleRatio = dimensions.width / width;
                ctx.beginPath();
                if (!solidRows || solidRows.length === 0) {
                    ctx.rect(0, 0, dimensions.width, dimensions.height);
                } else {
                    solidRows.forEach(({ x, y, width, height }) => {
                        ctx.rect(x * scaleRatio, y * scaleRatio, width * scaleRatio, height * scaleRatio);
                    });
                }
                ctx.clip();
            }}
        >
            <Shape
                sceneFunc={(context, shape) => {
                    const scaleRatio = dimensions.width / scale.width;
                    const rgba = maskColor || [255, 0, 0, 150];
                    const alpha = isSelected ? 0.3 : isHovered ? 0.1 : 0;
                    const strokeAlpha = isSelected ? 1 : isHovered ? 0.5 : 0;

                    // 1. Fill the mask area
                    context.beginPath();
                    solidRows.forEach(({ x, y, width, height }) => {
                        context.rect(
                            x * scaleRatio,
                            y * scaleRatio,
                            width * scaleRatio,
                            height * scaleRatio
                        );
                    });
                    context.fillStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`;
                    context.fill();
                    context.fillShape(shape);

                    // 2. Draw stroke around the mask
                    if (boundaryCoords && boundaryCoords.length > 0) {
                        context.beginPath();
                        boundaryCoords.forEach(({ x, y }) => {
                            context.rect(x * scaleRatio, y * scaleRatio, 1, 1);
                        });
                        context.strokeStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${strokeAlpha})`;
                        context.lineWidth = 1.5;
                        context.stroke();
                        context.fillStrokeShape(shape);
                    }
                }}
                opacity={1}
            />
        </Group>
    );
});

export default MaskShape;
