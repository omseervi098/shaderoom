import { useMemo, useRef, useState, useEffect } from "react";
import { Image, Line, Rect } from "react-konva";
import { useEditor } from "../../hooks/editor/editorContext.js";
import * as _ from "underscore";

export default function LassoMode(props) {
  const { register, width, height, setShowActionControls, setSelectedMaskId } = props;
  const { scale, maskOutput, setClicks, setMaskOutput, addMask } = useEditor();
  const [lassoPoints, setLassoPoints] = useState([]);
  const isDrawing = useRef(false);

  const scaleDown = ({ x, y }) => ({
    x: x / width,
    y: y / height,
  });

  const scaleUp = ({ x, y }) => ({
    x: x * width,
    y: y * height,
  });

  const getBoundingBox = (points) => {
    if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    const scaledPoints = points.map((point) => scaleUp(point));
    const xCoords = scaledPoints.map((p) => p.x);
    const yCoords = scaledPoints.map((p) => p.y);
    const scaleRatio = scale.width / width;
    const minX = Math.min(...xCoords) * scaleRatio;
    const maxX = Math.max(...xCoords) * scaleRatio;
    const minY = Math.min(...yCoords) * scaleRatio;
    const maxY = Math.max(...yCoords) * scaleRatio;
    return [
      {
        x: minX,
        y: minY,
        type: 2,
      },
      {
        x: maxX,
        y: maxY,
        type: 3,
      },
    ];
  };

  const boundingBox = useMemo(() => getBoundingBox(lassoPoints), [lassoPoints]);

  const handlePointerDown = (event) => {
    const stage = event.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);
    const down = scaleDown(pos);
    setLassoPoints([down]);
    setShowActionControls(true);
    setSelectedMaskId(null);
    isDrawing.current = true;
  };

  const handlePointerMove = (event) => {
    if (!isDrawing.current) return;
    const stage = event.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);
    const move = scaleDown(pos);
    setLassoPoints((prev) => [...prev, move]);
  };

  const handlePointerUp = (e) => {
    isDrawing.current = false;
    if (lassoPoints.length > 1) {
      if (!boundingBox) return;
      console.log(boundingBox);
      setClicks(boundingBox);
    }
    
  };
  const handlePointerOut = (e) => {
    isDrawing.current = false;
    // _.defer(() => setMaskOutput(null));
  };

  const handleConfirm = () => {
    if (maskOutput) {
      const confirmedMask = {
        id: Date.now(),
        mask: maskOutput,
        mode: "lasso",
        clicks: boundingBox,
      }
      addMask(confirmedMask);
      console.log("Mask confirmed with clicks:", confirmedMask);
    }
    setShowActionControls(false);
    _.defer(()=> setMaskOutput(null))
    setLassoPoints([]);
  };

  const handleReset = () => {
    _.defer(() => setMaskOutput(null));
    setLassoPoints([]);
    setShowActionControls(false);
  };

  useEffect(() => {
    register({
      confirm: handleConfirm,
      reset: handleReset,
    });
  }, [register, handleConfirm]);
  return (
    <>
      {maskOutput && (
        <Image
          image={maskOutput.image}
          x={0}
          y={0}
          width={width}
          height={height}
          objectFit={"contain"}
        />
      )}
      {lassoPoints.length > 1 && (
        <>
          <Line
            points={lassoPoints.flatMap((p) => Object.values(scaleUp(p)))}
            fill="rgba(72, 62, 168, 0.2)"
            stroke="black"
            strokeWidth={2}
            dash={[5, 5]}
            closed
          />
        </>
      )}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerOut}
        onContextMenu={(e) => {
          e.evt.preventDefault();
        }}
      />
    </>
  );
}
