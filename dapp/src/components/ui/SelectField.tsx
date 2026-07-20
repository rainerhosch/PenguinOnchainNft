"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Compatible with native select handlers: onChange(e) => e.target.value */
type ChangeEventLike = { target: { value: string } };

interface SelectFieldProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  fullWidth?: boolean;
  className?: string;
  id?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  onChange?: (e: ChangeEventLike) => void;
}

/**
 * Custom listbox (not native <select>) so the open menu is fully themed:
 * black glass panel + lime highlight — browser native option UI cannot do this.
 */
export default function SelectField({
  label,
  options,
  placeholder = "Select…",
  hint,
  fullWidth = true,
  className = "",
  id,
  value = "",
  disabled = false,
  required = false,
  name,
  onChange,
}: SelectFieldProps) {
  const autoId = useId();
  const selectId = id || autoId;
  const listboxId = `${selectId}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );
  const hasValue = Boolean(value && selected);

  const emit = useCallback(
    (next: string) => {
      onChange?.({ target: { value: next } });
    },
    [onChange]
  );

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  const openMenu = useCallback(() => {
    if (disabled || options.length === 0) return;
    setOpen(true);
    const idx = options.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
  }, [disabled, options, value]);

  const pick = useCallback(
    (opt: SelectOption) => {
      if (opt.disabled) return;
      emit(opt.value);
      close();
    },
    [emit, close]
  );

  // Click outside
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!open || highlight < 0 || !listRef.current) return;
    const el = listRef.current.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => {
        let next = h;
        for (let i = 0; i < options.length; i++) {
          next = (next + 1) % options.length;
          if (!options[next]?.disabled) return next;
        }
        return h;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => {
        let next = h < 0 ? 0 : h;
        for (let i = 0; i < options.length; i++) {
          next = (next - 1 + options.length) % options.length;
          if (!options[next]?.disabled) return next;
        }
        return h;
      });
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlight >= 0 && options[highlight]) pick(options[highlight]);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative ${fullWidth ? "w-full" : "w-auto"} ${className}`}
    >
      {label && (
        <span
          id={`${selectId}-label`}
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-400"
        >
          {label}
          {required ? <span className="text-primary-500"> *</span> : null}
        </span>
      )}

      {/* Hidden input for forms / accessibility name */}
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}

      <button
        type="button"
        id={selectId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${selectId}-label` : undefined}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        className={[
          "select-field relative flex w-full items-center justify-between gap-2 text-left",
          fullWidth ? "w-full" : "min-w-[10rem]",
          hasValue ? "text-white" : "text-neutral-400",
          open ? "border-primary-500 ring-2 ring-primary-500/25" : "",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        ].join(" ")}
      >
        <span className="truncate pr-1">
          {hasValue ? selected!.label : placeholder}
        </span>
        <span
          className={[
            "shrink-0 text-primary-400 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Custom listbox panel */}
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? `${selectId}-label` : selectId}
          tabIndex={-1}
          className="select-listbox absolute left-0 right-0 z-[80] mt-1.5 max-h-56 overflow-y-auto overscroll-contain py-1.5 outline-none"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-neutral-500">No options</li>
          ) : (
            options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isActive = index === highlight;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  onMouseEnter={() => !opt.disabled && setHighlight(index)}
                  onMouseDown={(e) => {
                    // prevent button blur race
                    e.preventDefault();
                    pick(opt);
                  }}
                  className={[
                    "select-listbox-item mx-1.5 flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    opt.disabled ? "cursor-not-allowed opacity-40" : "",
                    isSelected
                      ? "bg-primary-500/15 text-primary-400 font-medium"
                      : isActive
                        ? "bg-white/10 text-white"
                        : "text-neutral-200 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="h-4 w-4 shrink-0 text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}

      {hint && <p className="mt-1 text-[10px] text-neutral-500">{hint}</p>}
    </div>
  );
}
