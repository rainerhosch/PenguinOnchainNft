"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    Address
} from "viem";
import {
    useAccount,
    useWriteContract,
    useReadContract,
    useWaitForTransactionReceipt,
    type BaseError
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import toast, { Toaster } from 'react-hot-toast';
import { parseEther } from "ethers";


interface NftCardProps {
    nftData: number;
}

type Accessory = {
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



const NftCard: React.FC<NftCardProps> = ({ nftData }) => {

    const { chain } = useAccount();
    const [nfts, setNfts] = useState<{ id: number; name: string; image: string; traits: unknown }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSellAccessoryModal, setShowSellAccessoryModal] = useState(false);
    const [loadingToast, setLoadingToast] = React.useState<boolean | true>(true);

    // for selling form
    const [accesoryForSale, setAccesoryForSale] = useState(Number);
    const [nftIdSellingAcc, setNftIdSellingAcc] = useState(Number);
    const [accPrice, setAccPrice] = useState(0);
    const [accessoryType, setAccessoryType] = useState("");
    const [accessoryName, setAccessoryName] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    const abi = PengoContract.abi;
    const networkContract = PengoContract.networkDeployment.find(network =>  Number(network.chainId) === chain?.id);
    const contractAddress = networkContract?.PengoAddress as Address;

    // Read tokenURIs for each tokenId
    const { data: tokenURI } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokenURI",
        args: [nftData],
    }) || "";
    const { data: nftAccData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getNFTDetails",
        args: [nftData],
    });

    // const listOfAccesory: string[] = (nftAccData as string[]) || [];
    const listOfAccessories: Accessory[] = (nftAccData as [Accessory[], SpecialTrait])?.[0] || [];
    const specialTrait: SpecialTrait = (nftAccData as [Accessory[], SpecialTrait])?.[1] || { category: "", networth: "" };
    // console.log(nftAccData)

    useEffect(() => {
        setLoading(true);
        const fetchNftData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 5 seconds

                if (tokenURI === 'undefined') {
                    throw new Error();
                }
                const base64Data = (tokenURI as string).split(",")[1];
                const metadata = JSON.parse(atob(base64Data));

                const nftList = [{
                    id: nftData,
                    name: metadata.name,
                    image: metadata.image,
                    traits: metadata.traits
                }];
                setNfts(nftList);
            } catch (error) {
                console.log("Error fetching NFTs:", (error as BaseError).shortMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchNftData();
    }, [nftData, tokenURI]);

    // Hook selling transaction
    const { data: hash, error, isPending, writeContract } = useWriteContract();
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    async function handleFormSellAccessory(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        writeContract({
            address: contractAddress,
            abi,
            functionName: "listAccessoryForSale",
            args: [nftIdSellingAcc, accesoryForSale, parseEther(accPrice.toString())],
        });
    };


    React.useEffect(() => {
        if (error) {
            toast.error(<p className="text-sm font-mono text-red-900">Error: {(error as BaseError).shortMessage || error.message}</p>)
        }
    }, [error]);

    React.useEffect(() => {
        if (isConfirmed) {
            if (loadingToast) {
                // toast.dismiss(loadingToast); // Hapus toast loading
                setLoadingToast(false);
            }
            toast.success(<p className="text-sm font-mono text-black/50 text-[#60ff00">Transaction confirmed!</p>)
        }
    }, [isConfirmed, loadingToast]);


    React.useEffect(() => {
        if (isConfirmed && hash && networkContract?.explore) {
            toast.success(
                <p className="text-sm font-mono text-black/30">
                    Transaction Hash:<br />
                    <a
                        href={`${networkContract.explore}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#60ff00] underline"
                    >
                        {`${hash?.slice(0, 4)}...${hash?.slice(-10)}`}
                    </a>
                </p>
            );
            // window.location.reload(); // Reload the page after showing the toast
            setShowSellAccessoryModal(false);
            setShowModal(false);
        }
    }, [hash, isConfirmed, networkContract?.explore]);


    return (
        <>
            <Toaster position="bottom-right" reverseOrder={true} />
            {loading === true ?
                (<div className="flex flex-col bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white hover:transform hover:scale-105 transition-all items-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-900"></div>
                </div>) :
                nfts.map((nft) => (
                    <div
                        key={nft.id}
                        className="flex flex-col bg-white/10 p-2  rounded-2xl text-white hover:transform hover:scale-105 transition-all items-center"
                    >
                        <Image
                            className="bg-black/20 rounded-md"
                            src={nft.image}
                            alt={nft.name}
                            width={200}
                            height={200}
                            quality={75}
                            priority={false} // {false} | {true}
                        />
                        <h3 className="text-purple-950 text-sm sm:text-lg font-mono my-1">{nft.name}</h3>
                        {listOfAccessories.length > 0 ? (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-[8px] sm:text-xs font-mono sm:font-light border border-white py-1 px-2 bg-purple-900 rounded-sm hover:bg-black/30 hover:text-white my-2">
                                View Trait
                            </button>
                        ) : (
                            <p className="text-[8px] sm:text-xs font-mono sm:font-light text-white/20 border border-white/60 py-1 px-2 rounded-sm bg-purple-950/50 my-2 disabled:">No accessories</p>
                        )}
                        {showModal && (
                            <div className="fixed z-50 flex flex-col items-center justify-center bg-black/50 rounded-md">
                                <div className="bg-purple-950 rounded-lg p-4 flex flex-col justify-center ">
                                    <h2 className="font-mono mb-2 text-center">Accessories</h2>
                                    <div className="flex flex-col gap-2">
                                        {
                                            listOfAccessories.map((accessory, index) => (
                                                <button
                                                    disabled={accessory.forSale}
                                                    onClick={() => {
                                                        setNftIdSellingAcc(nft.id);
                                                        setAccesoryForSale(index);
                                                        setAccessoryType(accessory.trait_type);
                                                        setAccessoryName(accessory.trait_name);
                                                        setAccPrice(Number(accessory.lastPrice));
                                                        setShowModal(false);
                                                        setShowSellAccessoryModal(true); // Send data to form modalSellAccessory
                                                    }}
                                                    onMouseEnter={() => setIsHovered(true)}
                                                    onMouseLeave={() => setIsHovered(false)}
                                                    key={index} className={`flex flex-col bg-white/20 p-1 rounded-md ${accessory.forSale ? 'hover:bg-red-500' : 'hover:bg-blue-500'} text-center`}>
                                                    <div className="">
                                                        <div key={index} className="text-xs font-mono flex flex-col items-center">
                                                            {isHovered
                                                                ? !accessory.forSale ? `Sell ${accessory.trait_type}?` : `Listed!`
                                                                : `${accessory.trait_name}`
                                                            }
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                        {
                                            <div className="flex flex-col bg-white/20 p-2 rounded-md">
                                                <div className="flex flex-col justify-center text-xs font-mono">
                                                    <span className="text-center">Special Trait</span>
                                                    <span>Name : {specialTrait.category}</span>
                                                    <span>Networth : {specialTrait?.networth}</span>

                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="mt-4 bg-red-500/60 hover:bg-red-500 text-white py-1 px-2 rounded text-xs font-mono"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                ))}
            {showSellAccessoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/70">
                    <div className="flex flex-col bg-[#451696] rounded-lg p-8 sm:p-20 justify-center mx-auto max-w-[80vw] max-h-[80vh] sm:max-w-[60vw] sm:max-h-[60vh] overflow-auto">
                        <h5 className="text-sx sm:text-lg font-mono mb-2 text-center">Sell Accessory</h5>
                        <form onSubmit={handleFormSellAccessory} className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2 justify-center">
                                <input type="text" value={nftIdSellingAcc} readOnly hidden />
                                <input type="text" value={accesoryForSale} readOnly hidden />
                                <input
                                    type="text"
                                    value={accessoryType}
                                    className="text-center text-xs font-mono p-1 rounded-md bg-slate-400"
                                    readOnly
                                />
                                <input
                                    type="text"
                                    value={accessoryName}
                                    className="text-center text-xs font-mono p-1 rounded-md bg-slate-400"
                                    readOnly
                                />
                                <input
                                    type="number"
                                    step="0.001"
                                    placeholder="Selling Price (ETH)"
                                    value={accPrice || 0}
                                    onChange={(e) => setAccPrice(Math.max(0, Number(e.target.value)))}
                                    min="0"
                                    className="text-center text-xs font-mono p-1 rounded-md text-purple-950"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`mt-4 border border-white text-white py-1 px-2 rounded text-xs font-mono transition duration-200 ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-400'
                                    }`}
                                disabled={isPending}
                            >
                                {isPending ? 'Confirming...' : `Sell ${accPrice} ETH?`}
                            </button>
                        </form>
                        <button
                            onClick={() => setShowSellAccessoryModal(false)}
                            className="mt-2 bg-red-500/60 hover:bg-red-500 text-white py-1 px-2 rounded text-xs font-mono"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

            )}
        </>
    );
}

export default NftCard;
