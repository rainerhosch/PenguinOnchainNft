'use client'
import React, { useState } from "react";
import Image from "next/image";
import image1 from "@/app/images/pengo-base.svg";
import AppNavbar from "@/components/AppNavBar";
import Editor from '@/components/studio/Editor';
import NftList from '@/components/showcase/ListNfts';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from 'viem';
import {
    useAccount,
    useReadContract,
} from "wagmi";
import PengoContract from "@/constants/PengoContract.json";

function StudioPage(): JSX.Element {
    const [hideOptions, setHideOptions] = useState(false);
    const [hideDrawingCanvas, setHideDrawingCanvas] = useState(true);

    const [hideOptionsNfts, setHideOptionsNfts] = useState(false);
    const [showNftList, setShowNftList] = useState(true);
    const { address, status } = useAccount(); // Get the connected wallet address
    // console.log(status)
    // console.log(address)
    const contractAddress = PengoContract.address;
    const abi = PengoContract.abi;

    const { data: balanceCount } = useReadContract({
        address: contractAddress as Address,
        abi,
        functionName: "balanceOf",
        args: [address],
    });

    const initializeCanvas = () => {
        setHideOptions(!hideOptions);
        setHideDrawingCanvas(!hideDrawingCanvas);
    };

    const removeCanvas = () => {
        setHideOptions(false);
        setHideDrawingCanvas(true);
    };

    const showList = () => {
        setHideOptionsNfts(!hideOptionsNfts);
        setShowNftList(!showNftList);
    };

    const hideList = () => {
        setHideOptionsNfts(true);
        setShowNftList(false);
    };

    return (
        <>
            <div className="relative min-h-screen bg-[#9252ff] overflow-hidden">
                <AppNavbar />
                <main className="relative pt-24 pb-24 px-4 sm:px-4 sm:max-w-7.5xl mx-auto">
                    <div className="relative mb-16">
                        {(status == 'connected' || address != undefined) && Number(balanceCount) > 0 && (
                            <div className="bg-white/30 backdrop-blur-sm p-4 sm:p-8 text-white studio-container">
                                <h1 className="text-2xl font-bold mb-1">PENGO <span className="font-extralight">Studio</span></h1>
                                <div className="border border-purple-500 mb-8 rounded flex md:justify-end md:mx-auto">
                                    <div className="flex sm:flex-row flex-col sm:gap-4 gap-0 mx-3">
                                        <div className="my-1 sm:my-3">
                                            {hideDrawingCanvas &&
                                                <>
                                                    <button
                                                        className='text-sm border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40'
                                                        onClick={initializeCanvas}>Generate Canvas</button>
                                                </>
                                            }
                                            {hideOptions &&
                                                <>
                                                    <button
                                                        className='text-sm border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40'
                                                        onClick={removeCanvas}>Remove Canvas</button>
                                                </>
                                            }
                                        </div>
                                        {showNftList &&
                                            <>
                                                <div className="my-1 sm:my-3">
                                                    <button
                                                        className='text-sm border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40'
                                                        onClick={hideList}>Hide Nft List</button>
                                                </div>
                                            </>}
                                        {hideOptionsNfts &&
                                            <>
                                                <div className="my-1 sm:my-3">
                                                    <button
                                                        className='text-sm border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40'
                                                        onClick={showList}>Show Nft List</button>
                                                </div>
                                            </>}
                                    </div>
                                </div>

                                {/* List Ntfs */}
                                {showNftList &&
                                    <NftList />
                                }

                                {hideOptions &&
                                    <div className="flex justify-center md:mx-auto">
                                        <Editor />
                                    </div>
                                }
                            </div>

                        )}
                        {(status == 'connected' || address != undefined) && Number(balanceCount) == 0 && (
                            <div className="bg-[#7556a8]/60 backdrop-blur-sm p-4 sm:p-8 text-white studio-container">
                                <div className="flex flex-col max-h-dvh font-light items-center text-justify">
                                    <div className="">You do not hold any Pengos. Please mint or buy from the marketplace.</div>
                                    <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mt-4">
                                        <a href="/mint" className="text-sm border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40 text-center">Mint Pengo</a>
                                        <a target="_blank" href={`https://opensea.io/collection/penguin-onchain`} className="text-sm border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40 text-center">Buy on Marketplace</a>
                                    </div>
                                </div>
                            </div>
                        )}
                        {(status === 'disconnected' || status === 'connecting' || address === undefined) && (
                            <div className="bg-[#000000]/40 backdrop-blur-sm p-4 sm:p-8 text-white studio-container text-center items-center justify-center h-[900px]">
                                <h1 className="text-2xl font-extralight mb-1 font-mono">Connect your wallet for access, <span className="font-extralight">Pengo Studio</span></h1>
                                <div className="flex my-20 justify-center">
                                    <Image
                                        className="bg-black/20 rounded-md"
                                        src={image1}
                                        alt="Pengo"
                                        width={300}
                                        height={300}
                                    />
                                </div>
                                <div className="flex flex-row gap-2 justify-center">
                                    <ConnectButton />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default StudioPage;
