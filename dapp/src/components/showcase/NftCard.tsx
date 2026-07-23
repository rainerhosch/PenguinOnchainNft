"use client";

import React, { useEffect, useState } from "react";
import {
    Abi,
    Address,
} from "viem";
import {
    useAccount,
    useReadContract,
    type BaseError,
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import AccessoryModal from "./AccessoryModal";
import SellAccessoryModal from "./SellAccessoryModal";

interface NftCardProps {
    nftData: number;
}

type Accessory = {
    accessoryId: number;
    trait_name: string;
    trait_type: string;
    forSale: boolean;
    lastPrice: bigint;
    owner: string;
    sellingPrice: bigint;
    bytePixel?: string;
};

type SpecialTrait = {
    category: string;
    networth: string;
};

const NftCard: React.FC<NftCardProps> = ({ nftData }) => {
    const { chain } = useAccount();
    const [nfts, setNfts] = useState<
        { id: number; name: string; image: string; traits: any[]; networth: string }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSellAccessoryModal, setShowSellAccessoryModal] = useState(false);
    const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
        null
    );

    const networkContract =
        chain?.id !== undefined
            ? PengoContract.networkDeployment.find(
                (network) => Number(network.chainId) === chain.id
            )
            : PengoContract.networkDeployment[1];

    const abi = networkContract?.abi as Abi;
    const contractAddress = networkContract?.PengoAddress as Address;
    const currencySymbol = networkContract?.currency || "ETH";

    const { data: tokenURI, isLoading: isLoadingTokenURI } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokenURI",
        args: [nftData],
    });

    const { data: nftAccData, isLoading: isLoadingNftAcc } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getNFTDetails",
        args: [nftData],
    });

    const listOfAccessories: Accessory[] =
        (nftAccData as [Accessory[], SpecialTrait])?.[0] || [];
    const specialTrait: SpecialTrait = (nftAccData as [
        Accessory[],
        SpecialTrait,
    ])?.[1] || { category: "", networth: "" };

    useEffect(() => {
        setLoading(true);
        const fetchNftData = async () => {
            try {
                if (!tokenURI) return;

                const base64Data = (tokenURI as string).split(",")[1];
                const metadata = JSON.parse(atob(base64Data));

                console.log(metadata)

                const networthAttr = metadata.attributes?.find((attr: any) => attr.trait_type === "Net Worth (Accessories)");
                const dynamicNetworth = networthAttr ? networthAttr.value : "";

                setNfts([
                    {
                        id: nftData,
                        name: metadata.name,
                        image: metadata.image,
                        traits: metadata.attributes,
                        networth: dynamicNetworth
                    },
                ]);
            } catch (error) {
                console.error(
                    "Error fetching NFTs:",
                    (error as BaseError).shortMessage
                );
            }
        };

        fetchNftData();
    }, [nftData, tokenURI]);
    useEffect(() => {
        if (!isLoadingTokenURI && !isLoadingNftAcc) {
            setLoading(false);
        }
    }, [isLoadingTokenURI, isLoadingNftAcc]);

    if (loading) {
        return (
            <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3 animate-pulse">
                <div className="aspect-square w-full rounded-xl bg-white/10" />
                <div className="mt-3 h-3 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
                <div className="mt-3 h-8 w-full rounded-lg bg-white/5" />
            </div>
        );
    }

    return (
        <>
            {nfts.map((nft) => (
                <article
                    key={nft.id}
                    className="group flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all hover:border-primary-500/30 hover:bg-black/60"
                >
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-900 to-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={nft.image}
                            alt={nft.name}
                            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03] rounded-2xl"
                        />
                        <span className="absolute left-4 top-4 rounded-md bg-black/70 px-4 py-0.5 text-[10px] font-medium text-primary-400 backdrop-blur-sm border border-primary-500/20">
                            #{nft.id}
                        </span>
                        {listOfAccessories.length > 0 && (
                            <span className="absolute right-4 top-4 rounded-md bg-black/70 px-4 py-0.5 text-[10px] text-neutral-300 backdrop-blur-sm border border-white/10">
                                {listOfAccessories.length} traits
                            </span>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-3">
                        <h3 className="truncate text-sm font-semibold text-white">
                            {nft.name}
                        </h3>

                        {specialTrait.category ? (
                            <div className="grid grid-cols-2 gap-1.5">
                                <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                                    <p className="text-[9px] uppercase tracking-wider text-neutral-500">
                                        Goal
                                    </p>
                                    <p className="truncate text-[11px] font-medium text-neutral-200">
                                        {specialTrait.category}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-primary-500/20 bg-primary-500/10 px-2 py-1.5">
                                    <p className="text-[9px] uppercase tracking-wider text-primary-400/70">
                                        Net worth
                                    </p>
                                    <p className="truncate text-[11px] font-medium text-primary-400">
                                        {nft.networth || "—"}
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {listOfAccessories.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="mt-auto w-full rounded-xl border border-primary-500/30 bg-primary-500/10 py-2 text-xs font-semibold text-primary-400 transition-colors hover:bg-primary-500/20 hover:border-primary-500/50"
                            >
                                View traits
                            </button>
                        ) : (
                            <p className="mt-auto rounded-xl border border-dashed border-white/10 py-2 text-center text-[11px] text-neutral-600">
                                No accessories yet
                            </p>
                        )}
                    </div>
                </article>
            ))}

            {showModal && (
                <AccessoryModal
                    accessories={listOfAccessories}
                    metadataAttributes={nfts[0]?.traits}
                    pengoName={nfts[0]?.name}
                    nftId={nftData}
                    currencySymbol={currencySymbol}
                    setSelectedAccessory={setSelectedAccessory}
                    setShowModal={setShowModal}
                    setShowSellAccessoryModal={setShowSellAccessoryModal}
                />
            )}

            {showSellAccessoryModal && selectedAccessory && (
                <SellAccessoryModal
                    accessory={selectedAccessory}
                    nftId={nftData}
                    setShowSellAccessoryModal={setShowSellAccessoryModal}
                />
            )}
        </>
    );
};

export default NftCard;
