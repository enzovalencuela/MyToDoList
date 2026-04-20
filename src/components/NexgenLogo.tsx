"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NexgenLogoProps {
  variant?: "icon" | "full";
  className?: string;
}

export default function NexgenLogo({ variant = "icon", className = "" }: NexgenLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  const src = variant === "full"
    ? isDark ? "/nexgen-logo-icon-full_dark.png" : "/nexgen-logo-icon-full.png"
    : isDark ? "/nexgen-logo-icon_dark.png" : "/nexgen-logo-icon.png";

  return <img src={src} alt="Nexgen" className={className} />;
}
