"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface InputSearchProps {
  onSearch: (term: string) => void;
}

export default function InputSearch({ onSearch }: InputSearchProps) {
  const [value, setValue] = useState("");

  const debounceSearch = useCallback(
    (term: string) => {
      const timer = setTimeout(() => onSearch(term), 100);
      return () => clearTimeout(timer);
    },
    [onSearch]
  );

  useEffect(() => {
    const cleanup = debounceSearch(value);
    return cleanup;
  }, [value, debounceSearch]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--subText)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar tarefas..."
        className="w-full pl-10 pr-10 py-2.5 rounded-full bg-[var(--subbackground)] text-[var(--text)]
          placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subText)] hover:text-[var(--text)]"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
