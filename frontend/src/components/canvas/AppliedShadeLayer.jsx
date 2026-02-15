import React, { useEffect, useState } from "react";
import { Group, Shape } from "react-konva";
import { getBounds } from "../../utils/modesHelper.js";
import { warpImage } from "../../utils/perspective.js";

const AppliedShadeLayer = React.memo(({ mask, appliedShade, perspectivePoints, dimensions, scale, solidRows }) => {
    const [tiledImage, setTiledImage] = useState(null);

    useEffect(() => {
        if (appliedShade?.type === 'texture' && appliedShade.texture?.url) {
            const img = new window.Image();
            img.crossOrigin = "Anonymous";
            img.src = appliedShade.texture.url;
            img.onload = () => {
                // Get bounds of the mask
                const bounds = getBounds(mask.imageData);
                const boundsWidth = bounds.maxX - bounds.minX;
                const boundsHeight = bounds.maxY - bounds.minY;

                // Create offscreen canvas with expansion to allow pattern to extend beyond handles
                // We use 3x the bounds dimensions
                const expansionFactor = 3;
                const canvas = document.createElement('canvas');
                canvas.width = boundsWidth * expansionFactor;
                canvas.height = boundsHeight * expansionFactor;
                const ctx = canvas.getContext('2d');

                // Calculate scale based on repetition
                const repetition = appliedShade.tileRepetition || 4;
                const scaleFactor = (mask.width / repetition) / img.width;

                const pattern = ctx.createPattern(img, 'repeat');
                const matrix = new DOMMatrix();
                matrix.scaleSelf(scaleFactor, scaleFactor);

                // Offset the pattern to align with the center "bounds" area of our 3x3 grid
                matrix.translateSelf(
                    (boundsWidth - bounds.minX) / scaleFactor,
                    (boundsHeight - bounds.minY) / scaleFactor
                );

                pattern.setTransform(matrix);

                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // If perspective points are present, warp the image
                if (perspectivePoints) {
                    // Source points are the corners of the "center" block of our expanded canvas
                    const offsetX = boundsWidth;
                    const offsetY = boundsHeight;

                    const srcPoints = [
                        { x: offsetX, y: offsetY }, // Top-left
                        { x: offsetX + boundsWidth, y: offsetY }, // Top-right
                        { x: offsetX + boundsWidth, y: offsetY + boundsHeight }, // Bottom-right
                        { x: offsetX, y: offsetY + boundsHeight }  // Bottom-left
                    ];

                    // We want the output to be exactly the mask size
                    const outputSize = { width: mask.width, height: mask.height };
                    const warpedCanvas = warpImage(canvas, srcPoints, perspectivePoints, outputSize);
                    setTiledImage(warpedCanvas);
                } else {
                    // If no perspective, use full canvas
                    const fullCanvas = document.createElement('canvas');
                    fullCanvas.width = mask.width;
                    fullCanvas.height = mask.height;
                    const fullCtx = fullCanvas.getContext('2d');

                    // Reset pattern transform for normal drawing
                    const normalMatrix = new DOMMatrix();
                    normalMatrix.scaleSelf(scaleFactor, scaleFactor);
                    pattern.setTransform(normalMatrix);

                }
            };
        } else {
            setTiledImage(null);
        }
    }, [perspectivePoints, appliedShade, mask.width, mask.height, mask.imageData]);

    return (
        <Group
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
            listening={false} // Optimization: This layer doesn't need to listen to events
        >
            <Shape
                sceneFunc={(context, shape) => {
                    const scaleRatio = dimensions.width / scale.width;

                    if (appliedShade) {
                        context.save();
                        context.globalCompositeOperation = appliedShade.blendMode || 'multiply';
                        context.globalAlpha = appliedShade.opacity || 0.6;

                        context.beginPath();
                        solidRows.forEach(({ x, y, width, height }) => {
                            context.rect(
                                x * scaleRatio,
                                y * scaleRatio,
                                width * scaleRatio,
                                height * scaleRatio
                            );
                        });

                        if (appliedShade.type === 'color' && appliedShade.color) {
                            context.fillStyle = appliedShade.color.hex;
                            context.fill();
                        } else if (appliedShade.type === 'texture' && tiledImage) {
                            context.clip();
                            context.drawImage(
                                tiledImage,
                                0,
                                0,
                                mask.width * scaleRatio,
                                mask.height * scaleRatio
                            );
                        }

                        context.restore();
                        context.fillShape(shape);
                    }
                }}
                opacity={1}
                listening={false}
            />
        </Group>
    );
});

export default AppliedShadeLayer;
