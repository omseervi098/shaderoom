import { useGeneral } from "../hooks/general/generalContext.js";
import { X } from "lucide-react";

export default function Modal() {
  const { modal, closeModal } = useGeneral();
  const {
    title: { header, subHeader, icon, allowClose },
    content,
    action,
    allowFlexibleWidth,
  } = modal;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-primary-50 z-50 ">
      <div
        className={`bg-text-tertiary rounded-lg shadow-lg p-3 w-full ${allowFlexibleWidth ? "sm:w-max" : "sm:w-[90%] md:w-2/3 xl:w-1/2"} flex flex-col gap-3 max-h-screen overflow-auto `}
      >
        <div className="flex justify-between items-center ">
          <div className="w-full flex items-center gap-3">
            <div className="rounded-md p-2 border border-primary">{icon}</div>
            <div className=" text-text-primary">
              <h2 className="text-md font-semibold">{header}</h2>
              {subHeader && (
                <p className="text-xs text-text-secondary">{subHeader}</p>
              )}
            </div>
          </div>
          {allowClose && (
            <button
              onClick={closeModal}
              className="text-text-secondary hover:text-text-secondary/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between ">{content}</div>
        <div className="flex justify-end gap-2">
          {action &&
            action.map((btn, index) => (
              <button
                key={index}
                className={`
              ${
                index === action.length - 1
                  ? "bg-primary" + " hover:bg-primary/80"
                  : "bg-text-secondary" + " hover:bg-text-secondary/80"
              }
              text-text-tertiary font-bold py-1 px-4 rounded-md transition duration-300 ease-in-out cursor-pointer`}
                onClick={btn.onClick}
              >
                {btn.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
