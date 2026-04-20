"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { X, User, Settings, LogOut, HelpCircle, Info } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();

  const navItems = [
    { label: "Configurações", href: "/settings", icon: Settings },
    { label: "Sobre", href: "/about", icon: Info },
    { label: "Ajuda", href: "/help", icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed right-0 top-0 h-full w-[280px] z-50 flex flex-col
              bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] text-white shadow-2xl"
          >
            <div className="flex items-center justify-between p-4">
              <span className="text-lg font-bold">Menu</span>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center gap-2 py-6 border-b border-white/20">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <span className="font-semibold text-sm">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-full transition-all
                    hover:bg-[var(--background-2)] hover:text-[var(--primary)] group"
                >
                  <item.icon className="w-5 h-5 group-hover:text-[var(--primary)]" />
                  <span className="font-medium group-hover:gradient-text">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20 space-y-2">
              <ThemeSwitch />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-4 py-3 rounded-full w-full
                  hover:bg-red-500/20 transition-all text-red-200 hover:text-red-100"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
