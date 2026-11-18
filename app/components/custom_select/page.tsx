"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

type CustomSelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel?: string;
};

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  const index = keyword ? text.toLowerCase().indexOf(keyword.toLowerCase()) : -1;
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-yellow-500/30 text-inherit">
        {text.slice(index, index + keyword.length)}
      </mark>
      {text.slice(index + keyword.length)}
    </>
  );
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Type to search...",
  ariaLabel,
}: CustomSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return keyword ? options.filter((o) => o.label.toLowerCase().includes(keyword)) : options;
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active, query]);

  function openDropdown() {
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function closeDropdown() {
    setOpen(false);
    setQuery("");
  }

  function choose(option: SelectOption) {
    onChange(option.value);
    closeDropdown();
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      triggerRef.current?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? closeDropdown() : openDropdown())}
        className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3.5 text-left text-sm outline-none transition hover:border-gray-500 focus:border-blue-500"
      >
        <span className={selected ? "text-gray-100" : "text-gray-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg shadow-black/50">
          <input
            type="text"
            autoFocus
            autoComplete="off"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full border-b border-gray-800 bg-gray-900 p-3 text-sm text-gray-100 placeholder-gray-500 outline-none"
          />

          <div ref={listRef} role="listbox" className="max-h-52 overflow-y-auto">
            {filtered.map((o, i) => (
              <div
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                data-index={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o)}
                className={`cursor-pointer px-3.5 py-2.5 text-sm ${
                  i === active
                    ? "bg-blue-500/15 text-blue-300"
                    : o.value === value
                      ? "bg-blue-500/10 text-blue-300"
                      : "text-gray-300"
                }`}
              >
                <Highlight text={o.label} keyword={query.trim()} />
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="p-3 text-[13px] text-gray-500">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}