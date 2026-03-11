import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { LanguageProvider, useLanguage } from "./app/contexts/LanguageContext";
import { CurrencyProvider } from "./app/contexts/CurrencyContext";
import "./styles/index.css";

function CurrencyProviderWithLanguage({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  return <CurrencyProvider language={language}>{children}</CurrencyProvider>;
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <CurrencyProviderWithLanguage>
      <App />
    </CurrencyProviderWithLanguage>
  </LanguageProvider>
);
  