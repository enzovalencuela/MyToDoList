"use client";

import { useState, useCallback } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import SplashScreen from "./SplashScreen";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      <SessionProvider>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
