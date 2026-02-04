import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { CurrencyProvider } from "./app/contexts/CurrencyContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <CurrencyProvider children={<App />} />
);
  