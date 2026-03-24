import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { Toaster } from "sonner";
import * as Sentry from "@sentry/react";
import App from "./app/App.tsx";
import { LanguageProvider, useLanguage } from "./app/contexts/LanguageContext";
import { CurrencyProvider } from "./app/contexts/CurrencyContext";
import "./styles/index.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // 本番のみ有効化
  enabled: import.meta.env.PROD,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 0,
});

function CurrencyProviderWithLanguage({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  return <CurrencyProvider language={language}>{children}</CurrencyProvider>;
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

// createRoot は一度だけ呼ぶ（HMR で main が再実行されても二重呼び出しを防ぐ）
let root: Root | undefined = (container as HTMLElement & { _reactRoot?: Root })._reactRoot;
if (!root) {
  root = createRoot(container);
  (container as HTMLElement & { _reactRoot?: Root })._reactRoot = root;
}

function render() {
  root!.render(
    <LanguageProvider>
      <CurrencyProviderWithLanguage>
        <>
          <App />
          <Toaster richColors position="top-center" closeButton />
        </>
      </CurrencyProviderWithLanguage>
    </LanguageProvider>
  );
}

render();

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    render();
  });
}
  