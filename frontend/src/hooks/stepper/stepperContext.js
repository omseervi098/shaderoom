import { createContext, useContext } from "react";

export const StepperContext = createContext(null);

export const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepperContext must be used within a stepperProvider");
  }
  return context;
};
