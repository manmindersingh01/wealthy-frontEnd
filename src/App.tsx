import { useState } from "react";

import "./App.css";
import { Button } from "./components/ui/button";
import { TooltipProvider } from "./components/ui/tooltip";
//import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// import { Toaster } from "./components/ui/sonner";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        {/* // <Toaster /> */}
        {/* <SonnerToaster /> */}
      </TooltipProvider>
    </>
  );
}

export default App;
