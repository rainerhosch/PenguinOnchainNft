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
  /** xs = 10px, sm = 12px, md = default ~14px */
  size?: "xs" | "sm" | "md";
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
  size = "md",
  onChange,
}: SelectFieldProps) {
  const sizeStyles = {
    xs: {
      text: "text-[10px]",
      label: "mb-1 block text-[10px] font-medium uppercase tracking-wider text-neutral-400",
      pad: "py-1.5 pl-2 pr-2",
      itemPad: "px-2 py-1.5",
      icon: "h-3 w-3",
      listPy: "py-1",
      hint: "text-[9px]",
    },
    sm: {
      text: "text-[12px]",
      label: "mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-400",
      pad: "py-2 pl-2.5 pr-2.5",
      itemPad: "px-2.5 py-1.5",
      icon: "h-3.5 w-3.5",
      listPy: "py-1",
      hint: "text-[10px]",
    },
    md: {
      text: "text-sm",
      label: "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-400",
      pad: "py-2.5 pl-3 pr-3",
      itemPad: "px-3 py-2",
      icon: "h-4 w-4",
      listPy: "py-1.5",
      hint: "text-[10px]",
    },
  } as const;
  const s = sizeStyles[size] ?? sizeStyles.md;
  const textCls = s.text;
  const labelCls = s.label;
  const padCls = s.pad;
  const itemPadCls = s.itemPad;
  const iconCls = s.icon;
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
        <span id={`${selectId}-label`} className={labelCls}>
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
          "select-field relative flex w-full items-center justify-between gap-1.5 text-left",
          padCls,
          textCls,
          fullWidth ? "w-full" : "min-w-[10rem]",
          hasValue ? "text-white" : "text-neutral-400",
          open ? "border-primary-500 ring-2 ring-primary-500/25" : "",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        ].join(" ")}
      >
        <span className="truncate pr-1 leading-tight">
          {hasValue ? selected!.label : placeholder}
        </span>
        <span
          className={[
            "shrink-0 text-primary-400 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        >
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className={[
            "select-listbox absolute left-0 right-0 z-[80] mt-1 max-h-48 overflow-y-auto overscroll-contain outline-none",
            s.listPy,
          ].join(" ")}
        >
          {options.length === 0 ? (
            <li className={`px-2 py-2 text-neutral-500 ${textCls}`}>No options</li>
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
                    e.preventDefault();
                    pick(opt);
                  }}
                  className={[
                    "select-listbox-item mx-1 flex cursor-pointer items-center justify-between gap-2 rounded-md transition-colors",
                    itemPadCls,
                    textCls,
                    opt.disabled ? "cursor-not-allowed opacity-40" : "",
                    isSelected
                      ? "bg-primary-500/15 text-primary-400 font-medium"
                      : isActive
                        ? "bg-white/10 text-white"
                        : "text-neutral-200 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <span className="truncate leading-tight">{opt.label}</span>
                  {isSelected && (
                    <svg
                      className={`${iconCls} shrink-0 text-primary-400`}
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

      {hint && <p className={`mt-1 text-neutral-500 ${s.hint}`}>{hint}</p>}
    </div>
  );
}
