import { useState } from "react";
import { StepperContext } from "./stepperContext.js";
import { steps, registerFunctions } from "../../data/stepsConfig.js";
export const StepperProvider = ({ children }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentStep, setCurrentStep] = useState({
    name: steps[0].name,
    description: steps[0].description,
    component: steps[0].component,
    functions: {
      before: steps[0].functions.before,
      after: steps[0].functions.after
    }
  });
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      console.error("Already at the last step");
      return;
    }
    steps[activeStep+1].functions.before();
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setCurrentStep(steps[activeStep + 1]);
    steps[activeStep+1].functions.after();
  };
  const handlePrevious = () => {
    if (activeStep === 0) {
      console.error("Already at the first step");
      return;
    }
    steps[activeStep-1].functions.before();
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setCurrentStep(steps[activeStep - 1]);
    steps[activeStep-1].functions.after();
  };
  const handleReset = () => {
    if (activeStep === 0) {
      console.error("Already at the first step");
      return;   
    }
    steps[0].functions.before();
    setActiveStep(0);
    setCurrentStep(steps[0]);
    steps[1].functions.after();
  };
  const goToStep = (step) => {
    if (step < 0 || step >= steps.length) {
      console.error("Invalid step index");
      return;
    }
    steps[step].functions.before();
    setActiveStep(step);
    setCurrentStep(steps[step]);
    steps[step].functions.after();
  };

  return (
    <StepperContext.Provider
      value={{
        steps,
        activeStep,
        currentStep,
        handleNext,
        handlePrevious,
        handleReset,
        registerFunctions,
        goToStep,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};
