"use client";

import { useEffect, useState } from "react";

export default function AdminModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("admin_mode_enabled="));
    setEnabled(cookie?.split("=")[1] === "true");
  }, []);

  function updateCookie(value: boolean) {
    const expires = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 30,
    ).toUTCString();
    document.cookie = `admin_mode_enabled=${value}; Path=/; SameSite=Lax; Expires=${expires}`;
    setEnabled(value);
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-[var(--text)]">
          Ativar Modo Admin nos Testes
        </p>
        <p className="text-sm text-[var(--subText)]">
          Quando desativado, o sistema ignora privilégios de admin e simula
          usuário comum.
        </p>
      </div>
      <div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => updateCookie(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-focus:ring-2 peer-focus:ring-purple-300 transition-colors" />
          <span className="ml-3 text-sm font-medium text-[var(--text)]">
            {enabled ? "Ativo" : "Inativo"}
          </span>
        </label>
      </div>
    </div>
  );
}
