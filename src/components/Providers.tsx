"use client";

import { useEffect, useState, useCallback } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import SplashScreen from "./SplashScreen";

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    void (async () => {
      if (!session?.user?.email) {
        return;
      }

      try {
        const res = await fetch("/api/theme");
        const data = await res.json();
        if (data.currentTheme && data.currentTheme !== "default") {
          setTheme(data.currentTheme);
        } else if (theme !== "light") {
          setTheme("light");
        }
      } catch {
        // ignore theme sync failures
      }
    })();
  }, [session?.user?.email, setTheme]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
    >
      <SessionProvider>
        <ThemeSync>
          {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
          {children}
        </ThemeSync>
      </SessionProvider>
    </ThemeProvider>
  );
}
