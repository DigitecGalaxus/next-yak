import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { YakThemeProvider } from "next-yak";
import { getYakThemeContext } from "next-yak/context/baseContext";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <YakThemeProvider theme={getYakThemeContext()}>
      <App />
    </YakThemeProvider>
  </StrictMode>,
);
