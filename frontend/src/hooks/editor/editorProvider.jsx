import { useCallback, useEffect, useState} from "react";
import { getImageEmbedding } from "../../utils/modelHelpers.js";
import { EditorContext } from "./editorContext.js";

export const EditorProvider = ({ children }) => {
  const [image, setImage] = useState(null); // HTMLImageElement of Main Image
  const [clicks, setClicks] = useState([]);
  const [lastPredMask, setLastPredMask] = useState(null);
  const [maskOutput, setMaskOutput] = useState(null);
  const [error, setError] = useState(null);
  const [shades, setShades] = useState({
    textures: [],
    colors: [],
  }); //Shades consist of textures, colors
  const [selectedShade, setSelectedShade] = useState(null);
  const [scale, setScale] = useState({
    width: null,
    height: null,
    modelScale: null,
  }); //scale for onnx model
  const [embedding, setEmbedding] = useState(null); //embeddings
  const [embeddingStatus, setEmbeddingStatus] = useState(""); //status for
  // embedding
  const [mode, setMode] = useState("hover");
  const [viewMode, setViewMode] = useState("interact"); // 'view', 'interact', 'compare'

  const [maskState, setMaskState] = useState([]); // New state for confirmed masks
  const [operations, setOperations] = useState([]); // State for all operations for undo/redo
  const [finalImg, setFinalImg] = useState(null)

  const addMask = (mask) => {
    setMaskState((prev) => [...prev, { ...mask, appliedShade: null }]);
  };
  const removeMask = (id) => {
    setMaskState(prev => prev.filter(mask => mask.id !== id));
  };

  const applyShadeToMask = (maskId, shade) => {
    setMaskState(prev => {
      const currentMask = prev.find(m => m.id === maskId);
      if (currentMask) {
        const operation = {
          type: "shade",
          action: shade.type,
          maskId: maskId,
          previousShade: currentMask.appliedShade,
          newShade: shade
        };
        setOperations(prevOps => [...prevOps, operation]);
      }

      return prev.map(maskItem =>
        maskItem.id === maskId
          ? { ...maskItem, appliedShade: shade }
          : maskItem
      );
    });
  };
  const removeShadeFromMask = (maskId) => {
    setMaskState(prev => prev.map(mask =>
      mask.id === maskId
        ? { ...mask, appliedShade: null }
        : mask
    ));
  };

  const undoShade = () => {
    setOperations(prevOps => {
      if (prevOps.length === 0) return prevOps;
      const lastOp = prevOps[prevOps.length - 1];
      const newOps = prevOps.slice(0, -1);

      if (lastOp.type === "shade") {
        setMaskState(prevMasks => prevMasks.map(mask =>
          mask.id === lastOp.maskId
            ? { ...mask, appliedShade: lastOp.previousShade }
            : mask
        ));
      }
      return newOps;
    });
  };

  const resetShades = () => {
    setMaskState(prev => prev.map(mask => ({ ...mask, appliedShade: null })));
    setOperations([]);
  };

  const applyPerspectiveToMask = (maskId, points) => {
    setMaskState(prev => prev.map(maskItem =>
      maskItem.id === maskId
        ? { ...maskItem, perspectivePoints: points }
        : maskItem
    ));
  };
  useEffect(() => {
    if (image) {
      setEmbeddingStatus("loading");
      getImageEmbedding(image)
        .then((embedding) => {
          console.log("Embedding loaded", embedding);
          setEmbedding(embedding);
          setEmbeddingStatus("loaded");
        })
        .catch((error) => {
          console.error(error);
          setEmbeddingStatus("error");
        });
    }
  }, [image]);

  const updateImage = (image) => {
    setImage(image);
  };

  const updateScale = ({ width, height, modelScale }) => {
    setScale({
      width,
      height,
      modelScale,
    });
  };

  const updateShades = useCallback(
    (update) => {
      setShades((prevShades) => {
        if (!prevShades || !prevShades.colors || !prevShades.textures)
          return {
            colors: prevShades.colors,
            textures: prevShades.textures,
          };
        return {
          ...prevShades,
          ...update(prevShades),
        };
      });
    },
    [setShades],
  );

  const addColors = (newColors) => {
    updateShades((prev) => {
      const existingHexSet = new Set(prev.colors.map((color) => color.hex));
      const uniqueNewColors = newColors.filter(
        (color) => !existingHexSet.has(color.hex),
      );
      return { colors: [...prev.colors, ...uniqueNewColors] };
    });
  };

  const removeColor = (colorToRemove) => {
    updateShades((prev) => ({
      colors: prev.colors.filter((color) => color.hex !== colorToRemove.hex),
    }));
  };

  const addTextures = (newTextures) => {
    updateShades((prev) => ({
      textures: [...prev.textures, ...newTextures],
    }));
  };

  const removeTexture = (textureToRemove) => {
    updateShades((prev) => ({
      textures: prev.textures.filter(
        (texture) => texture.id !== textureToRemove.id,
      ),
    }));
  };

  return (
    <EditorContext.Provider
      value={{
        clicks,
        setClicks,
        lastPredMask,
        setLastPredMask,
        maskOutput,
        setMaskOutput,
        image,
        embedding,
        shades,
        selectedShade,
        setSelectedShade,
        scale,
        embeddingStatus,
        mode,
        maskState,
        finalImg,
        setFinalImg,
        addMask,
        removeMask,
        applyShadeToMask,
        applyPerspectiveToMask,
        setMode,
        addColors,
        removeColor,
        removeTexture,
        updateScale,
        addTextures,
        updateImage,
        viewMode,
        setViewMode,
        removeShadeFromMask,
        undoShade,
        resetShades,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
