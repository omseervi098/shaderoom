import { useEffect, useState } from "react";
import { Circle, Line, Rect } from "react-konva";
import { useEditor } from "../../hooks/editor/editorContext.js";
import { getBounds, polygonToMask } from "../../utils/modesHelper.js";
import { rgbStrToRgbaArray } from "../../utils/colors.js";

function Anchor(props) {
  const [strokeWidth, setStrokeWidth] = useState(2);
  return (
    <Circle
      x={props.point.x}
      y={props.point.y}
      radius={7}
      stroke="#483ea8"
      fill={props.fill}
      strokeWidth={strokeWidth}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        setStrokeWidth(3);
        props.onMouseOver();
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
        setStrokeWidth(2);
        props.onMouseOut();
      }}
      onPointerDown={() => {
        document.body.style.cursor = "default";
        props.onClick();
      }}
    />
  );
}
function PolygonOriginAnchor(props) {
  const isValid = props.validateMouseEvents();
  const [fill, setFill] = useState("transparent");
  return (
    <Anchor
      point={props.point}
      fill={fill}
      onClick={() => {
        if (isValid) {
          props.onValidClick();
        }
      }}
      onMouseOver={() => {
        if (isValid) {
          document.body.style.cursor = "pointer";
          setFill("green");
          props.onValidMouseOver();
        } else {
          document.body.style.cursor = "not-allowed";
          setFill("red");
        }
      }}
      onMouseOut={() => {
        setFill("transparent");
      }}
    />
  );
}


export default function PenMode(props) {
  const { register, width, height, setShowActionControls, setSelectedMaskId } = props;
  const { scale, addMask, maskState,selectedShade } = useEditor();
  const [points, setPoints] = useState([]);

  

  const [nextPoint, setNextPoint] = useState({ x: 0, y: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const handleClick = ({ x, y }) => {
    if (points.length === 0) {
      setShowActionControls(true);
      setSelectedMaskId(null);
    }
    setPoints(points.concat({ x, y }));
  };

  const scaleUp = ({ x, y }) => {
    return {
      x: x * props.width,
      y: y * props.height,
    };
  };

  const scaleDown = ({ x, y }) => {
    return {
      x: x / props.width,
      y: y / props.height,
    };
  };
  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setPoints([]);
    setIsComplete(false);
    setShowActionControls(false);
  };

  const handleConfirm = () => {
    console.log("Confirming points:", points);
    if (!isComplete || points.length < 3) {
      console.warn("Not enough points to create a polygon mask.");
      return;
    }
    console.log("Points confirmed:", points);
    const scaledPoints = points.map((point) => ({
      x: point.x * scale.width,
      y: point.y * scale.height
    }));

    let rgb = [0, 0, 255, 100];
    if (selectedShade && selectedShade.rgb) {
      rgb = rgbStrToRgbaArray(selectedShade.rgb, 150);
    }
    const { image, imageData } = polygonToMask(scaledPoints, scale.width, scale.height, rgb);
    const mask = {
      id: Date.now(),
      mode: "polygon",
      mask: {
        image,
        imageData,
        width: scale.width,
        height: scale.height,
        maskColor: rgb,
        bounds: getBounds(imageData),
      },
      input: points,
    };
    addMask(mask);
    console.log("Mask added:", mask);
    handleReset();
  }

  useEffect(() => {
    register({
      confirm: handleConfirm,
      undo: handleUndo,
      reset: handleReset,
    });
  }, [register, handleConfirm, handleUndo, handleReset]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <>
      <Line
        strokeWidth={2}
        stroke="#2a2276"
        opacity={0.9}
        fill="#483EA880"
        lineJoin="round"
        closed={isComplete}
        points={points
          .flatMap((point) =>
            Object.values(scaleUp({ x: point.x, y: point.y })),
          )
          .concat(Object.values(scaleUp({ x: nextPoint.x, y: nextPoint.y })))}
      />

      <Rect
        x={0}
        y={0}
        width={props.width}
        height={props.height}
        onPointerDown={(event) => {
          if (!isComplete) {
            // event.evt.preventDefault(); // prevent touch scrolling
            const stage = event.target.getStage();
            const pointer = stage.getPointerPosition();
            const transform = stage.getAbsoluteTransform().copy().invert();
            const pos = transform.point(pointer);
            const { x, y } = scaleDown({
              x: pos.x,
              y: pos.y,
            });
            handleClick({ x, y });
          }
        }}
        onPointerMove={(event) => {
          if (!isComplete) {
            const stage = event.target.getStage();
            const pointer = stage.getPointerPosition();
            const transform = stage.getAbsoluteTransform().copy().invert();
            const pos = transform.point(pointer);
            const { x, y } = scaleDown({
              x: pos.x,
              y: pos.y,
            });
            setNextPoint({ x, y });
          }
        }}
      />

      {points[0] && !isComplete && (
        <PolygonOriginAnchor
          point={scaleUp({ x: points[0].x, y: points[0].y })}
          onValidClick={() => {
            setNextPoint(points[0]);
            setIsComplete(true);
          }}
          onValidMouseOver={() => {
            setNextPoint(points[0]);
          }}
          validateMouseEvents={() => {
            return points.length > 2;
          }}
        />
      )}
    </>
  );
}
