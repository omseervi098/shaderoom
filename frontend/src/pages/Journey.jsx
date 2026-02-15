import Header from "../components/Header.jsx";
import Modal from "../components/Modal.jsx";
import Footer from "../components/Footer.jsx";
import { useStepper } from "../hooks/stepper/stepperContext.js";
import { useGeneral } from "../hooks/general/generalContext.js";
import { EditorProvider } from "../hooks/editor/editorProvider.jsx";
import * as ort from "onnxruntime-web/all";
import ONNXDecoderModel from "../assets/sam_vit_b_decoder.onnx";
import { useState, useEffect } from "react";
ort.env.wasm.numThreads = 1;
ort.env.logLevel = "error";

const getExecutionProviders = () => {
  const providers = [];

  //if browser supports (for gpu)
  if (typeof navigator !== "undefined" && navigator.gpu) {
    providers.push("webgpu");
  }

  // if browser support (for npu)
  if (typeof MLContext !== "undefined" || typeof MLGraphBuilder !== "undefined") {
    providers.push("webnn");
  }
  
  //cpu via web assembly
  providers.push("wasm");
  return providers;
};

const getModelSession = async () => {
  const session = await ort.InferenceSession.create(`${ONNXDecoderModel}`, {
    executionProviders: getExecutionProviders(),
    logSeverityLevel: 3,
  });
  console.log("models Loaded", session);
  return session;
};

export default function Journey() {
  const [modelSession, setModelSession] = useState(null);
  const { currentStep } = useStepper();
  const { isModalOpen } = useGeneral();
  const { name, component: Component } = currentStep;
  useEffect(() => {
    getModelSession()
      .then((modelSession) => {
        setModelSession(modelSession);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <EditorProvider>
      <>
        <div className="App  md:flex items-center md:justify-center bg-background md:py-5">
          <div className="bg-white md:rounded-2xl shadow-lg w-full md:w-[95%] flex flex-col">
            <Header />
            <div className="">
              <Component key={name} modelSession={modelSession} />
            </div>

            <Footer />
          </div>
        </div>
        {isModalOpen && <Modal />}
      </>
    </EditorProvider>
  );
}
