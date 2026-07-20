"use client";

import { useState } from "react";
import { Sketch } from "@uiw/react-color";
import Canvas from "@/components/studio/Canvas2";

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#acff00",
  "#8acc00",
  "#ff3b5c",
  "#ff9f1c",
  "#2ec4b6",
  "#4361ee",
  "#9b5de5",
  "#f15bb5",
  "#4a4a4a",
  "#c4c4c4",
];

const SHORTCUTS = [
  { keys: "Ctrl + S", action: "Toggle draw area (stays on until toggled off)" },
  { keys: "Ctrl + Z", action: "Undo pixel" },
  { keys: "Ctrl + X", action: "Redo pixel" },
  { keys: "Ctrl + Shift + Z", action: "Undo color" },
  { keys: "Ctrl + Shift + X", action: "Redo color" },
];

export default function Editor() {
  const [hex, setHex] = useState("#acff00");
  const [usedColors, setUsedColors] = useState<string[]>(["#acff00", "#000000", "#ffffff"]);

  const handleColorChange = (color: { hex: string }) => {
    const next = color.hex.toLowerCase();
    setHex(next);
    setUsedColors((prev) => {
      if (prev.includes(next)) return prev;
      return [next, ...prev].slice(0, 12);
    });
  };

  const pickColor = (c: string) => {
    const next = c.toLowerCase();
    setHex(next);
    setUsedColors((prev) => {
      if (prev.includes(next)) return prev;
      return [next, ...prev].slice(0, 12);
    });
  };

  return (
    <div id="editor" className="studio-workspace w-full">
      {/* Mobile tip bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-neutral-400 lg:hidden">
        <span className="font-medium text-primary-400">Tip</span>
        <span>Pick a color → paint on canvas → mint accessory on the right (scroll).</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] xl:items-start">
        {/* ── Tools / Color panel ── */}
        <aside className="studio-panel order-2 xl:order-1 xl:sticky xl:top-24 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">Color tools</h3>
            <div
              className="h-8 w-8 shrink-0 rounded-lg border-2 border-primary-500/60 shadow-[0_0_12px_rgba(172,255,0,0.25)]"
              style={{ backgroundColor: hex }}
              title={`Active ${hex}`}
            />
          </div>

          {/* Active color readout */}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/50 p-3">
            <div
              className="h-12 w-12 shrink-0 rounded-xl border border-white/20"
              style={{ backgroundColor: hex }}
            />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500">Active color</p>
              <p className="font-mono text-sm font-medium text-primary-400 truncate">{hex}</p>
            </div>
          </div>

          {/* Single compact Sketch picker */}
          <div className="studio-color-picker overflow-hidden rounded-xl border border-white/10 bg-black/60 p-2">
            <Sketch
              color={hex}
              onChange={handleColorChange}
              style={{
                background: "transparent",
                boxShadow: "none",
                width: "100%",
              }}
              className="!w-full studio-sketch"
            />
          </div>

          {/* Presets */}
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Presets
            </p>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => pickColor(c)}
                  className={[
                    "aspect-square rounded-lg border transition-transform hover:scale-110",
                    hex.toLowerCase() === c.toLowerCase()
                      ? "border-primary-400 ring-2 ring-primary-500/40"
                      : "border-white/15 hover:border-white/40",
                  ].join(" ")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Recent */}
          {usedColors.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Recent
              </p>
              <div className="flex flex-wrap gap-2">
                {usedColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => pickColor(c)}
                    className={[
                      "h-8 w-8 rounded-full border transition-transform hover:scale-110",
                      hex.toLowerCase() === c.toLowerCase()
                        ? "border-primary-400 ring-2 ring-primary-500/40"
                        : "border-white/20",
                    ].join(" ")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Shortcuts */}
          <div className="hidden sm:block rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Shortcuts
            </p>
            <ul className="space-y-1.5">
              {SHORTCUTS.map((s) => (
                <li
                  key={s.keys}
                  className="flex items-center justify-between gap-2 text-[11px] text-neutral-400"
                >
                  <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-neutral-300">
                    {s.keys}
                  </kbd>
                  <span className="text-right text-neutral-500">{s.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Canvas + mint (from Canvas) ── */}
        <div className="order-1 xl:order-2 min-w-0">
          <Canvas selectedColor={hex} />
        </div>
      </div>
    </div>
  );
}
