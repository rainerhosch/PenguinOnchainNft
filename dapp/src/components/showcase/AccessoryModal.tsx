"use client";

import React, { useEffect } from "react";
import { formatEther } from "viem";

type Accessory = {
  accessoryId: number;
  trait_name: string;
  trait_type: string;
  forSale: boolean;
  lastPrice: bigint;
  owner: string;
  sellingPrice: bigint;
};

type SpecialTrait = {
  category: string;
  networth: string;
};

interface AccessoryModalProps {
  accessories: Accessory[];
  specialTrait?: SpecialTrait;
  pengoName?: string;
  nftId?: number;
  currencySymbol?: string;
  setSelectedAccessory: (accessory: Accessory) => void;
  setShowModal: (show: boolean) => void;
  setShowSellAccessoryModal: (show: boolean) => void;
}

const AccessoryModal: React.FC<AccessoryModalProps> = ({
  accessories,
  specialTrait,
  pengoName,
  nftId,
  currencySymbol = "ETH",
  setSelectedAccessory,
  setShowModal,
  setShowSellAccessoryModal,
}) => {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShowModal]);

  const listedCount = accessories.filter((a) => a.forSale).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trait-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        aria-label="Close modal"
        onClick={() => setShowModal(false)}
      />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-md max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 shadow-[0_0_0_1px_rgba(172,255,0,0.08),0_24px_64px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-primary-400">
              Traits
            </p>
            <h2 id="trait-modal-title" className="truncate text-lg font-semibold text-white">
              {pengoName || (nftId != null ? `Pengo #${nftId}` : "Accessories")}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              {accessories.length} accessory{accessories.length !== 1 ? "ies" : ""}
              {listedCount > 0 ? ` · ${listedCount} listed` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-neutral-400 transition-colors hover:border-white/20 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Special traits */}
        {specialTrait && (specialTrait.category || specialTrait.networth) && (
          <div className="mx-5 mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">Life goal</p>
              <p className="truncate text-sm font-medium text-white">
                {specialTrait.category || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-primary-500/20 bg-primary-500/10 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-primary-400/80">Net worth</p>
              <p className="truncate text-sm font-medium text-primary-400">
                {specialTrait.networth || "—"}
              </p>
            </div>
          </div>
        )}

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {accessories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-neutral-500">
              No accessories on this Pengo yet
            </div>
          ) : (
            <ul className="space-y-2">
              {accessories.map((accessory) => {
                const listed = accessory.forSale === true;
                const last =
                  accessory.lastPrice && accessory.lastPrice > BigInt(0)
                    ? formatEther(accessory.lastPrice)
                    : null;
                const ask =
                  listed && accessory.sellingPrice > BigInt(0)
                    ? formatEther(accessory.sellingPrice)
                    : null;

                return (
                  <li key={accessory.accessoryId}>
                    <button
                      type="button"
                      disabled={listed}
                      onClick={() => {
                        setSelectedAccessory(accessory);
                        setShowModal(false);
                        setShowSellAccessoryModal(true);
                      }}
                      className={[
                        "group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                        listed
                          ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-70"
                          : "border-white/10 bg-black/40 hover:border-primary-500/40 hover:bg-primary-500/10",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                          listed
                            ? "bg-white/10 text-neutral-400"
                            : "bg-primary-500/20 text-primary-400",
                        ].join(" ")}
                      >
                        {accessory.trait_type.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-white">
                            {accessory.trait_name}
                          </p>
                          {listed ? (
                            <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                              Listed
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-md bg-primary-500/15 px-1.5 py-0.5 text-[10px] font-medium text-primary-400">
                              Sellable
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                          Slot · {accessory.trait_type}
                          {ask
                            ? ` · Ask ${ask} ${currencySymbol}`
                            : last
                              ? ` · Last ${last} ${currencySymbol}`
                              : ""}
                        </p>
                      </div>

                      {!listed && (
                        <span className="shrink-0 text-[11px] font-medium text-primary-400 opacity-0 transition-opacity group-hover:opacity-100">
                          Sell →
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/10 px-5 py-4">
          <p className="mb-3 text-center text-[10px] text-neutral-600">
            Select a sellable trait to list it on the marketplace
          </p>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="btn-secondary w-full py-2.5 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessoryModal;
