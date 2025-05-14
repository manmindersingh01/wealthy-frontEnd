//import { useState } from "react";

import "./App.css";
import { TooltipProvider } from "./components/ui/tooltip";
//import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import DynamicIsland from "./components/DynamicIsland";
import { Toaster } from "sonner";
// import { Toaster } from "./components/ui/sonner";
function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <DynamicIsland />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/account/:id" element={<Account />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/account/:id" element={<Account />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
          {/* // <Toaster /> */}
          {/* <SonnerToaster /> */}
        </TooltipProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
