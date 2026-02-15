import { Check, Circle as IconCircle, Square, Triangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Image, Layer, Shape, Stage } from "react-konva";
import { useEditor } from "../hooks/editor/editorContext.js";
import { getBoundaryFromImageData, getBounds, getMaskIndexOnHover, getSolidMaskRows } from "../utils/modesHelper.js";
import CompareSliderOverlay from "./canvas/CompareSliderOverlay.jsx";
import MaskControls from "./canvas/MaskControls.jsx";
import ViewModeSwitcher from "./canvas/ViewModeSwitcher.jsx";
import ZoomControls from "./canvas/ZoomControls.jsx";
import HoverMode from "./modes/HoverMode.jsx";
import LassoMode from "./modes/LassoMode.jsx";
import PenMode from "./modes/PenMode.jsx";
import AppliedShadeLayer from "./canvas/AppliedShadeLayer.jsx";
import MaskShape from "./canvas/MaskShape.jsx";
import { useStepper } from "../hooks/stepper/stepperContext.js";


export default function CanvasImage() {
  const { image, scale, mode, setMode, maskState, removeMask, applyShadeToMask, applyPerspectiveToMask, removeShadeFromMask, selectedShade, viewMode, setViewMode, finalImg, setFinalImg } = useEditor();
  const { registerFunctions } = useStepper();
  const containerRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const stageRef = useRef(null);
  const actionRef = useRef({
    confirm: null,
    undo: null,
    reset: null,
  })

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  // const [isDragging, setIsDragging] = useState(false);
  const [showActionControls, setShowActionControls] = useState(false);
  const [hoveredMaskId, setHoveredMaskId] = useState(null);
  const [selectedMaskId, setSelectedMaskId] = useState(null);

  // States for Texture Shades
  const [tileRepetition, setTileRepetition] = useState(4); // Default repetition
  const [isPerspectiveMode, setIsPerspectiveMode] = useState(false);
  const [perspectivePoints, setPerspectivePoints] = useState(null);

  // Compare Mode State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  // Blend modes for realistic color application
  const blendModes = [
    { mode: 'multiply', name: 'Natural', opacity: 0.6, icon: IconCircle },
    { mode: 'overlay', name: 'Vibrant', opacity: 0.5, icon: Square },
    { mode: 'soft-light', name: 'Subtle', opacity: 0.4, icon: Triangle },
    { mode: 'opaque', name: 'Bold', opacity: 0.9, icon: Check },
  ];

  const [currentBlendIndex, setCurrentBlendIndex] = useState(0);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;

  // Update Canvas Size on resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && image) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const isMobileScreen = window.innerWidth < 768;
        const imageAspectRatio = scale.width / scale.height;
        let width, height;

        if (isMobileScreen) {
          width = containerWidth;
          height = width / imageAspectRatio;
        } else {
          height = containerHeight;
          width = imageAspectRatio * height;
          if (width >= containerWidth) {
            width = containerWidth;
            height = width / imageAspectRatio;
          }
        }

        setDimensions({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    }
  }, [mode, image]);

  // Reset zoom and stage position 
  useEffect(() => {
    setZoom(1);
    setStagePos({ x: 0, y: 0 });
  }, [image]);

  // Update tile repetition when slider changes for selected mask
  useEffect(() => {
    if (selectedMaskId) {
      const mask = maskState.find(m => m.id === selectedMaskId);
      if (mask && mask.appliedShade && mask.appliedShade.type === 'texture') {
        if (mask.appliedShade.tileRepetition !== tileRepetition) {
          handleApplySelectedShade();
        }
      }
    }
  }, [tileRepetition]);

  // When a mask is selected, if it has a texture, set the slider to its repetition
  useEffect(() => {
    if (selectedMaskId) {
      const mask = maskState.find(m => m.id === selectedMaskId);
      if (mask && mask.appliedShade && mask.appliedShade.type === 'texture') {
        if (mask.appliedShade.tileRepetition) {
          setTileRepetition(mask.appliedShade.tileRepetition);
        }
        if (mask.perspectivePoints) {
          setPerspectivePoints(mask.perspectivePoints);
        } else {
          setPerspectivePoints(null);
        }
      } else {
        setIsPerspectiveMode(false);
        setPerspectivePoints(null);
      }
    } else {
      setIsPerspectiveMode(false);
      setPerspectivePoints(null);
    }
  }, [selectedMaskId, maskState]);

  // zoom utils
  const zoomIn = () => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    setZoom(newZoom);
    centerStage(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    if (newZoom <= MIN_ZOOM) {
      resetZoom();
      return;
    }
    setZoom(newZoom);
    centerStage(newZoom);
  };

  const resetZoom = () => {
    setZoom(1);
    setStagePos({ x: 0, y: 0 });
  };

  const centerStage = (newZoom) => {
    if (!stageRef.current) return;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const newPos = {
      x: centerX - (centerX * newZoom),
      y: centerY - (centerY * newZoom),
    };
    setStagePos(newPos);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    let newZoom = e.evt.deltaY < 0 ? zoom * scaleBy : zoom / scaleBy;
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    if (newZoom <= MIN_ZOOM) {
      resetZoom();
      return;
    }
    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / zoom,
      y: (pointer.y - stagePos.y) / zoom,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newZoom,
      y: pointer.y - mousePointTo.y * newZoom,
    };
    setZoom(newZoom);
    setStagePos(newPos);
  };

  const handleDragStart = (e) => {
    if (e.target !== stageRef.current) return;
    // setIsDragging(true);
    if (mode === "lasso" || mode === "hover") {
      setMode(`pan-${mode}`);
    }
  };

  const handleDragEnd = (e) => {
    if (e.target !== stageRef.current) return;
    // setIsDragging(false);
    setStagePos({ x: e.target.x(), y: e.target.y() });
    if (mode === "pan-lasso" || mode === "pan-hover") {
      setTimeout(() => setMode(mode.replace("pan-", "")), 100);
    }
  };

  const handleDragMove = (e) => {
    if (e.target !== stageRef.current) return;
    const stage = e.target;
    const scale = stage.scaleX();
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    const scaledWidth = containerWidth * scale;
    const scaledHeight = containerHeight * scale;
    let newX = stage.x();
    if (scaledWidth > containerWidth) {
      const maxX = 0;
      const minX = containerWidth - scaledWidth;
      newX = Math.max(minX, Math.min(maxX, newX));
    } else {
      newX = (containerWidth - scaledWidth) / 2;
    }
    let newY = stage.y();
    if (scaledHeight > containerHeight) {
      const maxY = 0;
      const minY = containerHeight - scaledHeight;
      newY = Math.max(minY, Math.min(maxY, newY));
    } else {
      newY = (containerHeight - scaledHeight) / 2;
    }
    stage.position({ x: newX, y: newY });
  };

  // select mask on hover
  const handleMouseMove = (e) => {
    //Only call if maskState is availabe and not empty
    if (!maskState || maskState.length === 0 || viewMode === 'compare') return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);

    // Scale the position to match the original image dimensions
    const scaleRatio = scale.width / dimensions.width;
    pos.x *= scaleRatio;
    pos.y *= scaleRatio;

    getMaskIndexOnHover({
      maskState: maskState,
      coords: pos,
    }).then((foundMaskId) => {
      if (foundMaskId !== null) {
        setHoveredMaskId(foundMaskId);
      } else {
        setHoveredMaskId(null);
      }
    }).catch((error) => {
      // console.error("Error getting mask index on hover:", error);
      setHoveredMaskId(null);
    });
  };

  // Compare Mode Slider utils
  const handleSliderMove = useCallback(
    (clientX) => {
      if (imageWrapperRef.current) {
        const rect = imageWrapperRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPosition(percent);
      }
    },
    []
  );

  const handleSliderMouseMove = useCallback(
    (e) => {
      if (!isResizing) return;
      handleSliderMove(e.clientX);
    },
    [isResizing, handleSliderMove]
  );

  const handleSliderTouchMove = useCallback(
    (e) => {
      if (!isResizing) return;
      handleSliderMove(e.touches[0].clientX);
    },
    [isResizing, handleSliderMove]
  );

  const handleSliderMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);


  useEffect(() => {
    registerFunctions(3, () => {
      const stage = stageRef.current;
      if (!stage) return;

      const [baseLayer, , appliedLayer] = stage.getLayers(); // 0 and 2 in your current order

      const w = stage.width();
      const h = stage.height();
      const out = document.createElement("canvas");
      out.width = w;
      out.height = h;

      const ctx = out.getContext("2d");

      // Render only chosen layers
      ctx.drawImage(baseLayer.toCanvas(), 0, 0);
      ctx.drawImage(appliedLayer.toCanvas(), 0, 0);

      // final export
      const finalDataUrl = out.toDataURL("image/png");
      setFinalImg(finalDataUrl);
    }, null)
  }, [registerFunctions, setFinalImg])
  // handling compare mode slider events 
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleSliderMouseMove);
      window.addEventListener('mouseup', handleSliderMouseUp);
      window.addEventListener('touchmove', handleSliderTouchMove);
      window.addEventListener('touchend', handleSliderMouseUp);
    } else {
      window.removeEventListener('mousemove', handleSliderMouseMove);
      window.removeEventListener('mouseup', handleSliderMouseUp);
      window.removeEventListener('touchmove', handleSliderTouchMove);
      window.removeEventListener('touchend', handleSliderMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleSliderMouseMove);
      window.removeEventListener('mouseup', handleSliderMouseUp);
      window.removeEventListener('touchmove', handleSliderTouchMove);
      window.removeEventListener('touchend', handleSliderMouseUp);
    };
  }, [isResizing, handleSliderMouseMove, handleSliderMouseUp, handleSliderTouchMove]);

  // register action handlers
  const register = (handlers) => {
    actionRef.current = handlers;
  };

  // handling action events
  const handleConfirm = () => {
    if (actionRef.current.confirm) {
      actionRef.current.confirm();
    } else {
      console.warn("Confirm action not registered.");
    }
  };
  const handleUndo = () => {
    if (actionRef.current.undo) {
      actionRef.current.undo();
    } else {
      console.warn("Undo action not registered.");
    }
  };
  const handleReset = () => {
    if (actionRef.current.reset) {
      actionRef.current.reset();
    } else {
      console.warn("Reset action not registered.");
    }
  };

  // Apply selected shade to mask
  const handleApplySelectedShade = () => {
    if (!selectedMaskId) return;

    let shadeToApply = selectedShade;
    const currentMask = maskState.find(m => m.id === selectedMaskId);

    if (!shadeToApply && currentMask && currentMask.appliedShade) {
      shadeToApply = currentMask.appliedShade.texture || currentMask.appliedShade.color;
    }

    if (!shadeToApply && !currentMask?.appliedShade) return;

    const currentBlend = blendModes[currentBlendIndex];
    let shade = {};
    const isTexture = shadeToApply.url;

    if (isTexture) {
      const textureObj = shadeToApply.url ? shadeToApply : currentMask.appliedShade.texture;

      shade = {
        type: "texture",
        texture: textureObj,
        blendMode: currentBlend.mode,
        opacity: currentBlend.opacity,
        tileRepetition: tileRepetition
      };
      if (perspectivePoints) {
        applyPerspectiveToMask(selectedMaskId, perspectivePoints);
      } else {
        const bounds = getBounds(currentMask.mask.imageData);
        const initialPoints = [
          { x: bounds.minX, y: bounds.minY }, // Top-left
          { x: bounds.maxX, y: bounds.minY }, // Top-right
          { x: bounds.maxX, y: bounds.maxY }, // Bottom-right
          { x: bounds.minX, y: bounds.maxY }  // Bottom-left
        ];
        applyPerspectiveToMask(selectedMaskId, initialPoints);
      }
    } else {
      const colorObj = shadeToApply.hex ? shadeToApply : currentMask.appliedShade.color;
      shade = {
        type: "color",
        color: colorObj,
        blendMode: currentBlend.mode,
        opacity: currentBlend.opacity
      };
    }

    applyShadeToMask(selectedMaskId, shade);
  };

  // perpective utils
  const togglePerspectiveMode = () => {
    if (isPerspectiveMode) {
      setIsPerspectiveMode(false);
      handleApplySelectedShade();
    } else {
      if (!perspectivePoints) {
        const mask = maskState.find(m => m.id === selectedMaskId);
        if (mask) {
          const bounds = getBounds(mask.mask.imageData);
          const initialPoints = [
            { x: bounds.minX, y: bounds.minY },
            { x: bounds.maxX, y: bounds.minY },
            { x: bounds.maxX, y: bounds.maxY },
            { x: bounds.minX, y: bounds.maxY }
          ];
          setPerspectivePoints(initialPoints);

          const currentMask = maskState.find(m => m.id === selectedMaskId);
          if (currentMask && currentMask.appliedShade) {
            applyPerspectiveToMask(selectedMaskId, initialPoints);
          }
        }
      }
      setIsPerspectiveMode(true);
    }
  };

  const handlePerspectiveDrag = (index, e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);

    const scaleRatio = scale.width / dimensions.width;
    const x = pos.x * scaleRatio;
    const y = pos.y * scaleRatio;

    const newPoints = [...perspectivePoints];
    newPoints[index] = { x, y };
    setPerspectivePoints(newPoints);
  };
  const resetPerspective = () => {
    if (perspectivePoints) {
      const mask = maskState.find(m => m.id === selectedMaskId);
      if (mask) {
        const bounds = getBounds(mask.mask.imageData);
        const initialPoints = [
          { x: bounds.minX, y: bounds.minY },
          { x: bounds.maxX, y: bounds.minY },
          { x: bounds.maxX, y: bounds.maxY },
          { x: bounds.minX, y: bounds.maxY }
        ];
        setPerspectivePoints(initialPoints);
        applyPerspectiveToMask(selectedMaskId, initialPoints);
      }
    }
  };

  const handlePerspectiveDragEnd = () => {
    handleApplySelectedShade();
  };

  const cycleBlendMode = () => {
    setCurrentBlendIndex((prev) => (prev + 1) % blendModes.length);
  };

  return (
    <div className={`relative w-full h-full ${mode === "polygon" ? "cursor-pen" : "cursor-default"} flex justify-center`} ref={containerRef}>
      {/* Action Controls */}
      <MaskControls
        selectedMaskId={selectedMaskId}
        maskState={maskState}
        selectedShade={selectedShade}
        tileRepetition={tileRepetition}
        setTileRepetition={setTileRepetition}
        isPerspectiveMode={isPerspectiveMode}
        resetPerspective={resetPerspective}
        togglePerspectiveMode={togglePerspectiveMode}
        handleApplySelectedShade={handleApplySelectedShade}
        cycleBlendMode={cycleBlendMode}
        currentBlendIndex={currentBlendIndex}
        blendModes={blendModes}
        removeShadeFromMask={removeShadeFromMask}
      />

      <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />

      <ZoomControls
        zoom={zoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        MAX_ZOOM={MAX_ZOOM}
        MIN_ZOOM={MIN_ZOOM}
        selectedMaskId={selectedMaskId}
        removeMask={removeMask}
        setSelectedMaskId={setSelectedMaskId}
        setMode={setMode}
        mode={mode}
        viewMode={viewMode}
        showActionControls={showActionControls}
        actionRef={actionRef}
        handleConfirm={handleConfirm}
        handleUndo={handleUndo}
        handleReset={handleReset}
      />

      {/* Image Wrapper to constrain slider and stage */}
      <div
        ref={imageWrapperRef}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          position: 'relative'
        }}
      >
        <CompareSliderOverlay
          viewMode={viewMode}
          sliderPosition={sliderPosition}
          setIsResizing={setIsResizing}
          isResizing={isResizing}
        />

        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          scaleX={zoom}
          scaleY={zoom}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={handleWheel}
          draggable={zoom > 1 && !isPerspectiveMode}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          onPointerMove={handleMouseMove}
        >
          {/* Base image layer */}
          <Layer>
            <Image
              image={image}
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              objectFit={"contain"}
            />
          </Layer>

          {/* Interactive modes layer - rendered below confirmed masks */}
          <Layer>
            {viewMode === 'interact' && mode === "lasso" && (
              <LassoMode
                setShowActionControls={setShowActionControls}
                setSelectedMaskId={setSelectedMaskId}
                register={register} width={dimensions.width} height={dimensions.height} />
            )}
            {viewMode === 'interact' && mode === "hover" && (
              <HoverMode
                register={register}
                width={dimensions.width}
                height={dimensions.height}
                setSelectedMaskId={setSelectedMaskId}
                setShowActionControls={setShowActionControls}
                isOverConfirmedMask={hoveredMaskId !== null}
              />
            )}
            {viewMode === 'interact' && mode === "polygon" && (
              <PenMode
                setSelectedMaskId={setSelectedMaskId}
                setShowActionControls={setShowActionControls}
                register={register} width={dimensions.width} height={dimensions.height} />
            )}
          </Layer>

          {/* Applied shades and masks layer */}
          <Layer>
            {maskState && maskState.map((maskData) => (
              maskData.appliedShade && (
                <AppliedShadeLayer
                  key={`shade-${maskData.id}`}
                  mask={maskData.mask}
                  appliedShade={maskData.appliedShade}
                  perspectivePoints={maskData.perspectivePoints}
                  dimensions={dimensions}
                  scale={scale}
                  solidRows={getSolidMaskRows(maskData.mask.imageData)}
                />
              )))}
            
          </Layer>
          <Layer>
            {maskState && maskState.map((maskData) => (
              <MaskShape
                key={`mask-item-${maskData.id}`}
                mask={maskData.mask}
                id={maskData.id}
                dimensions={dimensions}
                scale={scale}
                isSelected={selectedMaskId === maskData.id}
                isHovered={hoveredMaskId === maskData.id}
                maskColor={maskData.mask.maskColor}
                solidRows={getSolidMaskRows(maskData.mask.imageData)}
                boundaryCoords={getBoundaryFromImageData(maskData.mask.imageData)}
                onClick={() => {
                  if (!showActionControls && !isPerspectiveMode && viewMode !== 'compare') {
                    setSelectedMaskId(maskData.id)
                  }
                }}
              />
            ))}
          </Layer>

          {/* Perspective Handles Layer */}
          <Layer>
            {isPerspectiveMode && perspectivePoints && (
              <Group>
                {perspectivePoints.map((point, index) => {
                  const scaleRatio = dimensions.width / scale.width;
                  return (
                    <Circle
                      key={index}
                      x={point.x * scaleRatio}
                      y={point.y * scaleRatio}
                      radius={8 / zoom} // Keep handle size constant visually
                      fill="white"
                      stroke="purple"
                      strokeWidth={2 / zoom}
                      draggable
                      onDragMove={(e) => handlePerspectiveDrag(index, e)}
                      onDragEnd={handlePerspectiveDragEnd}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage().container();
                        container.style.cursor = "move";
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage().container();
                        container.style.cursor = "default";
                      }}
                    />
                  );
                })}
                {/* Draw connecting lines for better visualization */}
                <Shape
                  sceneFunc={(ctx, shape) => {
                    const scaleRatio = dimensions.width / scale.width;
                    ctx.beginPath();
                    ctx.moveTo(perspectivePoints[0].x * scaleRatio, perspectivePoints[0].y * scaleRatio);
                    ctx.lineTo(perspectivePoints[1].x * scaleRatio, perspectivePoints[1].y * scaleRatio);
                    ctx.lineTo(perspectivePoints[2].x * scaleRatio, perspectivePoints[2].y * scaleRatio);
                    ctx.lineTo(perspectivePoints[3].x * scaleRatio, perspectivePoints[3].y * scaleRatio);
                    ctx.closePath();
                    ctx.strokeStyle = "rgba(128, 0, 128, 0.5)";
                    ctx.lineWidth = 2 / zoom;
                    ctx.stroke();
                  }}
                />
              </Group>
            )}
          </Layer>

          {/* Compare Mode: Before Image Layer (Clipped) */}
          {viewMode === 'compare' && (
            <Layer>
              <Group
                clipFunc={(ctx) => {
                  const sliderScreenX = (dimensions.width * sliderPosition) / 100;
                  const clipX = (sliderScreenX - stagePos.x) / zoom;

                  ctx.rect(
                    -10000, // Far left
                    -10000, // Top
                    clipX - (-10000), // Width to reach clipX
                    20000 // Large height
                  );
                }}
              >
                <Image
                  image={image}
                  x={0}
                  y={0}
                  width={dimensions.width}
                  height={dimensions.height}
                  objectFit={"contain"}
                />
              </Group>
            </Layer>
          )}
        </Stage>
      </div>
    </div >
  );
}
