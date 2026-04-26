import Landing from "./pages/Landing";
import Journey from "./pages/Journey";
import { Route, Routes } from "react-router";
import { StepperProvider } from "./hooks/stepper/stepperProvider";
import { GeneralProvider } from "./hooks/general/generalProvider";

function App() {
  
  return (
    <GeneralProvider>
      <StepperProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/journey" element={<Journey />} />
        </Routes>
      </StepperProvider>
    </GeneralProvider>
  );
}

export default App;
