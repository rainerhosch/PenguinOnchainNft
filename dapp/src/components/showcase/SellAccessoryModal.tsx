"use client";

import React, { useEffect, useRef, useState } from "react";
import { Address, Abi, parseEther, formatEther } from "viem";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  type BaseError,
} from "wagmi";
import toast from "react-hot-toast";
import PengoContract from "../../constants/PengoContract.json";
import {
  txToastError,
  txToastPending,
  txToastSuccess,
  txToastWallet,
} from "@/lib/txToast";

interface SellAccessoryModalProps {
  accessory: {
    accessoryId: number;
    trait_name: string;
    trait_type: string;
    sellingPrice: bigint;
    lastPrice: bigint;
  };
  nftId: number;
  setShowSellAccessoryModal: (show: boolean) => void;
}

const SELL_TX_TOAST = "sell-accessory-tx";

const SellAccessoryModal: React.FC<SellAccessoryModalProps> = ({
  accessory,
  nftId,
  setShowSellAccessoryModal,
}) => {
  const defaultPrice =
    accessory.lastPrice && accessory.lastPrice > BigInt(0)
      ? Number(formatEther(accessory.lastPrice))
      : 0;
  const [sellPrice, setSellPrice] = useState(defaultPrice);

  const { chain } = useAccount();

  const networkContract =
    chain?.id !== undefined
      ? PengoContract.networkDeployment.find(
          (network) => Number(network.chainId) === chain.id
        )
      : PengoContract.networkDeployment[1];

  const abi = networkContract?.abi as Abi;
  const contractAddress = networkContract?.PengoAddress as Address;
  const currencySymbols = networkContract?.currency || "ETH";

  const {
    data: hash,
    error,
    isPending,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const handledErrorRef = useRef<string | null>(null);
  const handledSuccessRef = useRef(false);
  const handledHashRef = useRef<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending && !isConfirming) {
        setShowSellAccessoryModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, isConfirming, setShowSellAccessoryModal]);

  useEffect(() => {
    if (!error) return;
    const key = error.message;
    if (handledErrorRef.current === key) return;
    handledErrorRef.current = key;
    txToastError(
      SELL_TX_TOAST,
      (error as BaseError).shortMessage || error.message || "List failed"
    );
  }, [error]);

  useEffect(() => {
    if (!hash) return;
    if (handledHashRef.current === hash) return;
    handledHashRef.current = hash;
    txToastPending(SELL_TX_TOAST, hash, networkContract?.explore);
  }, [hash, networkContract?.explore]);

  useEffect(() => {
    if (!isSuccess || !hash || handledSuccessRef.current) return;
    handledSuccessRef.current = true;
    txToastSuccess(SELL_TX_TOAST, {
      title: "Accessory listed for sale",
      hash,
      explorer: networkContract?.explore,
      reloadMs: 1800,
    });
    setShowSellAccessoryModal(false);
  }, [isSuccess, hash, networkContract?.explore, setShowSellAccessoryModal]);

  useEffect(() => {
    if (!isReceiptError || !receiptError) return;
    txToastError(
      SELL_TX_TOAST,
      (receiptError as BaseError).shortMessage ||
        receiptError.message ||
        "Transaction reverted"
    );
  }, [isReceiptError, receiptError]);

  const handleSell = () => {
    if (isPending || isConfirming) return;
    if (!sellPrice || sellPrice <= 0) {
      toast.error("Enter a valid price greater than 0", { id: "sell-price" });
      return;
    }

    handledErrorRef.current = null;
    handledSuccessRef.current = false;
    handledHashRef.current = null;
    resetWrite();

    txToastWallet(SELL_TX_TOAST, "Confirm listing in your wallet…");

    writeContract({
      address: contractAddress,
      abi: abi,
      functionName: "listAccessoryForSale",
      args: [nftId, accessory.accessoryId, parseEther(sellPrice.toString())],
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        aria-label="Close"
        disabled={isPending || isConfirming}
        onClick={() => {
          if (!isPending && !isConfirming) setShowSellAccessoryModal(false);
        }}
      />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 shadow-[0_0_0_1px_rgba(172,255,0,0.08),0_24px_64px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary-400">
            List for sale
          </p>
          <h2 className="text-lg font-semibold text-white">
            Pengo #{nftId}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            <span className="text-white font-medium">{accessory.trait_name}</span>
            <span className="text-neutral-600"> · </span>
            {accessory.trait_type}
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          {accessory.lastPrice > BigInt(0) && (
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-neutral-400">
              Last sale:{" "}
              <span className="font-medium text-neutral-200">
                {formatEther(accessory.lastPrice)} {currencySymbols}
              </span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Price ({currencySymbols})
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={sellPrice || ""}
              onChange={(e) =>
                setSellPrice(Math.max(0, Number(e.target.value) || 0))
              }
              className="input-field text-sm"
              placeholder={`0.00 ${currencySymbols}`}
              disabled={isPending || isConfirming}
            />
            {sellPrice > 0 && (
              <p className="mt-1.5 text-[11px] text-primary-400">
                Listing for {sellPrice} {currencySymbols}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={isPending || isConfirming}
              onClick={() => setShowSellAccessoryModal(false)}
              className="btn-secondary flex-1 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending || isConfirming || sellPrice <= 0}
              onClick={handleSell}
              className={`btn-primary flex-1 py-2.5 text-sm ${
                isPending || isConfirming || sellPrice <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isPending
                ? "Confirm in wallet…"
                : isConfirming
                  ? "Confirming…"
                  : "List accessory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellAccessoryModal;
