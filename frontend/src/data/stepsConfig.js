import SelectImage from "../components/content/SelectImage.jsx";
import SelectShades from "../components/content/SelectShades.jsx";
import ShadeRoom from "../components/content/ShadeRoom.jsx";
import SaveShare from "../components/content/SaveShare.jsx";


export const steps = [
  {
    name: "Select Image",
    description: "Choose an image from your device.",
    component: SelectImage,
    functions: {
      before: () => {
        console.log("Before function for Select Image");
      },
      after: () => {
        console.log("After function for Select Image");
      },
    }
  },
  {
    name: "Select Shades",
    description: "Choose colors, textures to apply.",
    component: SelectShades,
    functions: {
      before: () => {
        console.log("Before function for Select Shades");
      },
      after: () => {
        console.log("After function for Select Shades");
      },
    }
  },
  {
    name: "Shade Room",
    description: "Visualize your design in a room.",
    component: ShadeRoom,
    functions: {
      before: () => {
        console.log("Before function for Shade Room");
      },
      after: () => {
        console.log("After function for Shade Room");
      },
    }
  },
  {
    name: "Save & Share",
    description: "Save your design or share it with others.",
    component: SaveShare,
    functions: {
      before: () => {
        console.log("Before function for Save & Share");
      },
      after: () => {
        console.log("After function for Save & Share");
      },
    }
  },
];

export const registerFunctions = (stepIndex, before_fn, after_fn) => {
  if (stepIndex < 0 || stepIndex >= steps.length) {
    console.error("Invalid step index");
    return;
  }
  if(before_fn){
    steps[stepIndex].functions.before = before_fn;
  }
  if(after_fn){
    steps[stepIndex].functions.after = after_fn;
  }
}
