"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Read theme from localStorage (same key next-themes uses)
    const saved = localStorage.getItem("theme");
    setIsDark(saved === "dark");
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => onFinish(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const iconSrc = isDark ? "/nexgen-logo-icon_dark.png" : "/nexgen-logo-icon.png";
  const fullSrc = isDark ? "/nexgen-logo-icon-full_dark.png" : "/nexgen-logo-icon-full.png";

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center
            ${isDark
              ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]"
              : "bg-gradient-to-br from-[var(--primary)] via-[#6c3bd5] to-[var(--secondary)]"
            }`}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl animate-pulse" />
          </div>

          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative z-10 mb-6"
          >
            <img
              src={iconSrc}
              alt="Nexgen"
              className="w-24 h-24 drop-shadow-2xl"
            />
          </motion.div>

          {/* Full logo / Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={phase === "text" ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            <img
              src={fullSrc}
              alt="Nexgen"
              className="h-10 mb-3 drop-shadow-lg"
            />
            <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
              Nexgen Tasks
            </h1>
            <p className="mt-2 text-white/70 text-sm font-medium">
              Organize. Priorize. Conquiste.
            </p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="relative z-10 mt-10 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-white/60"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
