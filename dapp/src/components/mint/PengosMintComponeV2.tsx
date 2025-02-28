'use client'
import * as React from 'react';
import { Address } from 'viem';
import Image from "next/image";
import image1 from "@/app/images/pengo-template.svg";
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    type BaseError,
} from "wagmi";
import { ethers } from "ethers";
import toast, { Toaster } from 'react-hot-toast';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PengoContract from "../../constants/PengoContract.json";

export default function PengosMintComponent() {
    const { address, status, chain } = useAccount();
    const [loadingToast, setLoadingToast] = React.useState<boolean | true>(true);
    
    const abi = PengoContract.abi;
    const networkContract = PengoContract.networkDeployment.find(network =>  Number(network.chainId) === chain?.id);
    const contractAddress = networkContract?.PengoAddress;
    

    // Check if the connected user's chain matches the expected chain
    if (!networkContract) {
        toast.error("Please connect to the correct network.");
    }



    // State for contract data
    const [totalMint, setTotalMint] = React.useState(1);


    // Hooks for read price
    const { data: price } = useReadContract({
        address: contractAddress as Address,
        abi,
        functionName: "MINT_PRICE",
    });

    const { data: balanceCount } = useReadContract({
        address: contractAddress as Address,
        abi,
        functionName: "balanceOf",
        args: [address],
    });

    const { data: mintLimit } = useReadContract({
        address: contractAddress as Address,
        abi,
        functionName: "MAX_MINT_PER_WALLET",
    });

    // Hook minting transaction
    const { data: hash, error, isPending, writeContract } = useWriteContract();

    const { isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    // Send mint transaction
    async function handleMint(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!totalMint || totalMint < 1) return;
        if (Number(balanceCount) + totalMint > Number(mintLimit)) {
            toast.error("Mint limit exceeded!");
            return;
        }

        writeContract({
            address: contractAddress as Address,
            abi,
            functionName: "mintPengo",
            args: [BigInt(totalMint)],
            value: BigInt(Number(price) * totalMint),
        });
    }

    React.useEffect(() => {
        if (error) {
            toast.error(<p className="text-sm font-mono text-red-900">Error: {(error as BaseError).shortMessage || error.message}</p>)
        }
    }, [error]);

    React.useEffect(() => {
        if (isConfirmed) {
            if (loadingToast) {
                setLoadingToast(false);
            }
            toast.success(<p className="text-sm font-mono text-black/50 text-[#60ff00">Transaction confirmed!</p>)
        }
    }, [isConfirmed, loadingToast]);

    React.useEffect(() => {
        if (hash && networkContract?.explore) {
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
        }
    }, [hash, networkContract?.explore]);

    return (
        <div className="bg-black/40 rounded-lg shadow-lg p-6 text-center mx-auto max-w-fit">
            <Toaster position="bottom-right" reverseOrder={true} />
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold mb-4">Penguin Onchain NFT</h2>
                <Image src={image1} alt="Penguin Template" width={200} height={200} priority={true} />
                <div className="flex flex-col gap-0 justify-center mb-4">
                    <div className="flex flex-row gap-2 justify-center">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-mono text-white/30">Mint Price</p>
                            <p className="text-sm font-mono text-white/30">Your Balance</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-mono text-white/30"> {price ? ethers.formatEther(BigInt(Number(price))) : '0'} ETH</p>
                            <p className="text-sm font-mono text-white/30"> {balanceCount?.toString()} PENGO</p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleMint} className="flex flex-col gap-2 justify-center">
                    <div className="flex flex-row gap-2 justify-center">
                        <button
                            className="bg-black/50 focus:bg-white/20 font-mono text-white py-2 px-4 rounded"
                            type="button"
                            onClick={() => setTotalMint((prev) => Math.max(1, prev - 1))}>
                            -
                        </button>
                        <p className="mx-auto">{totalMint}</p>
                        <button
                            className="bg-black/50 focus:bg-white/20 font-mono text-white py-2 px-4 rounded"
                            type="button"
                            onClick={() => setTotalMint((prev) => Math.min(Number(mintLimit) || 10, prev + 1))}>
                            +
                        </button>
                    </div>
                    {(status === 'disconnected' || status == 'connecting' || address == undefined) ? (
                        <div className="flex flex-row gap-2 justify-center">
                            <ConnectButton />
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className={`bg-black/50 font-mono text-white py-2 px-4 rounded transition duration-200 ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black'}`}
                            disabled={isPending}>
                            {isPending ? 'Confirming...' : 'Mint Pengo'}
                        </button>
                    )}
                    <p className="mx-auto text-sm font-mono text-white/50">
                        Price amount {ethers.formatEther(BigInt(Number(price) || 0) * BigInt(totalMint))} ETH
                    </p>
                </form>
            </div>
        </div>
    );
}