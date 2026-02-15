import { Check } from "lucide-react";
import { useStepper } from "../hooks/stepper/stepperContext.js";

export default function Stepper() {

  const { steps, activeStep, goToStep } = useStepper();
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-center items-center max-w-lg relative space-y-2 sm:space-y-0">
        {steps?.map((step, i) => (
          <div
            key={i}
            className={`
                relative flex sm:flex-col items-center w-36 
                ${i !== 0
                ? "sm:before:content-[''] sm:before:absolute" +
                " sm:before:w-full" +
                " sm:before:h-[3px] sm:before:right-2/4" +
                " sm:before:top-1/3" +
                " sm:before:-translate-y-2/4"
                : ""
              } 
                ${i <= activeStep ? "before:bg-primary" : "before:bg-gray-400"}
            `}
          >
            <div
              className={`m-0 mr-2 sm:mr-0 sm:mb-1 cursor-pointer
                w-8 h-8 flex items-center justify-center z-8 relative border-2  rounded-full font-semibold  
                ${activeStep === i
                  ? "bg-primary text-text-tertiary border-primary"
                  : i < activeStep
                    ? "bg-background text-primary border-primary"
                    : "border-text-secondary text-text-secondary bg-secondary"
                }
               `}
              onClick={() => goToStep(i)}
            >
              {i + 1 <= activeStep ? <Check size={24} /> : i + 1}
            </div>
            <p
              className={`
              text-sm
              ${activeStep === i
                  ? "text-primary"
                  : i < activeStep
                    ? "text-text-primary"
                    : "text-text-secondary"
                }`}
            >
              {step.name}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
