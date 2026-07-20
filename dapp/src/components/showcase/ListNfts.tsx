"use client";

import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import NftCard from "@/components/showcase/NftCard";

export default function NftList() {
  const { address, chain } = useAccount();
  const [nftListOf, setNftList] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  const networkContract =
    chain?.id !== undefined
      ? PengoContract.networkDeployment.find(
          (network) => Number(network.chainId) === chain.id
        )
      : PengoContract.networkDeployment[1];

  const abi = networkContract?.abi;
  const contractAddress = networkContract?.PengoAddress as Address;

  const { data: listOf, isLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "tokensOfOwner",
    args: [address],
    query: { enabled: Boolean(address && contractAddress) },
  });

  useEffect(() => {
    if (listOf) {
      const listOfAddress: string[] = (listOf as string[]) || [];
      setNftList(listOfAddress.map(String));
    }
  }, [listOf]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (!address) {
    return (
      <p className="py-8 text-center text-sm text-neutral-500">
        Connect your wallet to see your collection
      </p>
    );
  }

  if (nftListOf.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
        <p className="text-sm text-neutral-400">No Pengos in this wallet yet</p>
        <a href="/mint" className="mt-3 inline-block text-sm font-medium text-primary-400 hover:underline">
          Mint your first Pengo →
        </a>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {nftListOf.slice(0, visibleCount).map((id) => (
          <NftCard key={id} nftData={Number(id)} />
        ))}
      </div>

      {visibleCount < nftListOf.length && (
        <div className="mt-6 text-center">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-primary-500/40 hover:text-primary-400"
            onClick={() => setVisibleCount((prev) => prev + 12)}
          >
            Load more ({nftListOf.length - visibleCount} left)
          </button>
        </div>
      )}
    </div>
  );
}
