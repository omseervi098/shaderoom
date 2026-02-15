import Stepper from "./Stepper";
import { useState } from "react";
import { Menu, X } from "lucide-react";
export default function Header() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  return (
    <div className="bg-secondary px-6 py-3 rounded-t-2xl w-full flex flex-col md:flex-row md:justify-center">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-bold text-center bg-gradient-to-br from-primary via-purple-500 to-primary-50 text-transparent bg-clip-text m-0 p-0">
          ShadeRoom
        </h1>
        <button
          className="md:hidden"
          onClick={() => setIsNavbarOpen(!isNavbarOpen)}
        >
          {isNavbarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Add Nav as new block below header*/}
      <nav
        className={`${
          isNavbarOpen ? "flex justify-center" : "hidden"
        } md:flex md:items-center md:justify-end w-full mt-4 md:mt-0`}
      >
        <Stepper />
      </nav>
    </div>
  );
}
