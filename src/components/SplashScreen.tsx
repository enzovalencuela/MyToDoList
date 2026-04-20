"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<"icon" | "full" | "exit">("icon");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("full"), 1200);
    const t2 = setTimeout(() => setPhase("exit"), 2800);
    const t3 = setTimeout(() => onFinish(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const iconSrc = "/nexgen-logo-icon.png";
  const fullSrc = "/nexgen-logo-icon-full.png";

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1f2937]"
        >
          {/* Glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl animate-pulse" />
          </div>

          {/* Logo area - single spot, swap between icon and full */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-6">
              <AnimatePresence mode="wait">
                {phase === "icon" ? (
                  <motion.img
                    key="icon"
                    src={iconSrc}
                    alt="Nexgen"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 drop-shadow-2xl absolute inset-0"
                  />
                ) : (
                  <motion.img
                    key="full"
                    src={fullSrc}
                    alt="Nexgen"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 14 }}
                    className="h-24 drop-shadow-2xl absolute inset-0 object-contain"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Text - appears with full logo */}
            <AnimatePresence>
              {phase === "full" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
                  className="flex flex-col items-center"
                >
                  <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                    Nexgen Tasks
                  </h1>
                  <p className="mt-2 text-white/70 text-sm font-medium">
                    Organize. Priorize. Conquiste.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
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
