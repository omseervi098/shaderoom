import { useEditor } from "../../hooks/editor/editorContext.js";
import { useStepper } from "../../hooks/stepper/stepperContext.js";
import { useCallback, useEffect, useRef } from "react";
import { transformDataForModel } from "../../utils/modelHelpers.js";
import { arrayToImageData, imageDataToImage, onnxMaskToImage } from "../../utils/imageHelpers.js";
import { ImageEditor } from "../ImageEditor.jsx";
import { rgbStrToRgbaArray } from "../../utils/colors.js";

export default function ShadeRoom({ modelSession }) {
  const {
    image,
    clicks,
    lastPredMask,
    scale,
    mode,
    embedding,
    embeddingStatus,
    setMaskOutput,
    selectedShade,
    setLastPredMask,
  } = useEditor();
  const { goToStep } = useStepper();
  const runningRef = useRef(false);
  const rerunRequestedRef = useRef(false);
  const latestRef = useRef({
    modelSession: null,
    clicks: null,
    embedding: null,
    scale: null,
    lastPredMask: null,
    mode: null,
  });

  latestRef.current = {
    modelSession,
    clicks,
    embedding,
    scale,
    lastPredMask,
    mode,
  };

  const runONNX = useCallback(async () => {
    try {
      const {
        modelSession: currentSession,
        clicks: currentClicks,
        embedding: currentEmbedding,
        scale: currentScale,
        lastPredMask: currentLastPredMask,
        mode: currentMode,
      } = latestRef.current;

      if (
        currentSession === null ||
        currentClicks === null ||
        currentEmbedding === null ||
        currentScale === null
      )
        return null;
      else {
        const input = {
          clicks: currentClicks,
          modelScale: currentScale,
          embedding: currentEmbedding,
          lastPredMask: currentLastPredMask,
          mode: currentMode,
        };
        const feeds = transformDataForModel(input);
        if (feeds === undefined) return;

        const results = await currentSession.run(feeds);
        setLastPredMask(results.low_res_masks.data);
        const output = results[currentSession.outputNames[0]];
        let rgb = [0, 0, 255, 100];

        setMaskOutput(onnxMaskToImage({
          input: output.data,
          width: output.dims[2],
          height: output.dims[3],
          maskColor: rgb,
        }));
      }
    } catch (e) {
      console.log(e);
    }
  }, [setLastPredMask, setMaskOutput]);

  const runONNXSerial = useCallback(async () => {
    if (runningRef.current) {
      rerunRequestedRef.current = true;
      return;
    }

    runningRef.current = true;
    try {
      do {
        rerunRequestedRef.current = false;
        await runONNX();
      } while (rerunRequestedRef.current);
    } finally {
      runningRef.current = false;
    }
  }, [runONNX]);

  useEffect(() => {
    if (embeddingStatus === "error") {
      // goToStep(0);
    }
  }, [embeddingStatus]);
  useEffect(() => {
    runONNXSerial().then(() => {
      console.log("Mask Image Generated");
    });
  }, [clicks, runONNXSerial]);
  return (
    <div className="w-full h-full">
      {embeddingStatus === "loading" ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="w-full h-full md:rounded-b-md overflow-hidden bg-text-secondary/40">
          {/*Welcome To Shade Room*/}
          <ImageEditor />
        </div>
      )}
      {/* Add your content here */}
    </div>
  );
}
