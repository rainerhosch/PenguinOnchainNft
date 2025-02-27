"use client";
import { useEffect, useState } from "react";
import AppNavbar from "@/components/AppNavBar";
import {
    // useAccount,
    // useWriteContract,
    // useReadContract,
    // useWaitForTransactionReceipt,
    // type BaseError
    createConfig
} from "wagmi";
import { monadTestnet, sepolia } from "wagmi/chains";
import { watchContractEvent } from '@wagmi/core'
import {
    // parseEther, 
    formatEther
} from "ethers";
import {
    http,
    Address
} from "viem";
import PengoContract from "../../constants/PengoContract.json";
export const config = createConfig({
    chains: [sepolia, monadTestnet],
    transports: {
        [sepolia.id]: http(),
        [monadTestnet.id]: http(),
    },
    ssr: false,
});
export default function MarketplacePage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [accessories, setAccessories] = useState([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(true);


    const contractAddress = PengoContract.address as Address;
    // const networkContract = PengoContract.networkDeployment[0];
    const abi = PengoContract.abi;

    // Read tokenURIs for each tokenId
    const unwatch = watchContractEvent(config, {
        abi,
        eventName: 'AccessoryListed',
        onLogs(logs) {
            console.log('Logs changed!', logs)
        },
    })
    unwatch()
    console.log(Accessory)
    // const { data: Accessory } = useReadContract({
    //     address: contractAddress,
    //     abi,
    //     functionName: "totalSupply",
    //     // args: [nftData],
    // }) || "";
    // console.log(Accessory)

    useEffect(() => {
        fetchAccessories();
    }, []);

    async function fetchAccessories() {
        //     try {
        //         setIsLoading(true);
        //         const result = await useReadContract({
        //             address: contractAddress,
        //             abi,
        //             functionName: "getAllAccessoriesForSale", // Ganti dengan function dari smart contract
        //         });

        //         setAccessories(result);
        //     } catch (error) {
        //         console.error("Error fetching accessories:", error);
        //     } finally {
        //         setIsLoading(false);
        //     }
    }

    // async function handleBuy(accessoryId, price) {
    //     try {
    //         await writeContract({
    //             address: contractAddress,
    //             abi,
    //             functionName: "buyAccessory",
    //             args: [accessoryId],
    //             value: parseEther(price.toString()), // Konversi ETH ke WEI
    //         });
    //         alert("Purchase successful!");
    //         fetchAccessories(); // Refresh data setelah transaksi
    //     } catch (error) {
    //         console.error("Transaction failed:", error);
    //     }
    // }

    return (
        <div className="relative min-h-screen bg-[#9252ff] overflow-hidden">
            <AppNavbar />
            <main className="relative pt-24 pb-24 px-4 sm:px-4 sm:max-w-7.5xl mx-auto">
                <div className="relative mb-16">

                    <div className="min-h-screen bg-gray-900 text-white p-6">
                        <h1 className="text-center text-2xl font-bold mb-6">Marketplace</h1>

                        {isLoading ? (
                            <p className="text-center">Loading accessories...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {accessories.length === 0 ? (
                                    <p className="text-center col-span-full">No accessories for sale</p>
                                ) : (
                                    accessories.map((acc, index) => (
                                        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                            <h2 className="text-lg font-semibold">{acc.name}</h2>
                                            <p>ID: {acc.id}</p>
                                            <p>Type: {acc.type}</p>
                                            <p>Price: {formatEther(acc.price)} ETH</p>
                                            <button
                                                // onClick={() => handleBuy(acc.id, acc.price)}
                                                className="mt-4 bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div></main></div>
    );
}
