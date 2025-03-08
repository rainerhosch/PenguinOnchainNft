import React, { useEffect, useState } from "react";
import { parseEther } from "ethers";
import { Address, Abi } from "viem";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    type BaseError
} from "wagmi";
import toast from "react-hot-toast";

import PengoContract from "../../constants/PengoContract.json";

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

const SellAccessoryModal: React.FC<SellAccessoryModalProps> = ({
    accessory,
    nftId,
    setShowSellAccessoryModal,
}) => {
    const [sellPrice, setSellPrice] = useState(0);
    // const [accPrice, setAccPrice] = useState(0);

    const { chain } = useAccount();

    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[1];

    const abi = networkContract?.abi as Abi;
    const contractAddress = networkContract?.PengoAddress as Address;

    const { data: hash, error, isPending, writeContract} = useWriteContract();
    const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });


    const handleSell = () => {
        if (sellPrice === 0) {
            toast.error(`Invalid price!`, { id: `invalid-price`, style: { background: 'rgba(255, 0, 119, 0.37)', color: '#fff', fontFamily: 'monospace' } });
            return;
        }

        writeContract({
            address: contractAddress,
            abi: abi,
            functionName: "listAccessoryForSale",
            args: [nftId, accessory.accessoryId, parseEther(sellPrice.toString())],
        });
    };

    useEffect(() => {
        if (error) {
            toast.error(`Error: ${(error as BaseError).shortMessage || error.message}`, { id: `invalid-price`, style: { background: 'rgba(255, 0, 119, 0.37)', color: '#fff', fontFamily: 'monospace' } })
        }

        if(isSuccess){
            toast.success(`Accessory listed successfully!`, { id: `invalid-price`, style: { background: 'rgba(140, 0, 255, 0.582)', color: '#fff', fontFamily: 'monospace' } });
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
            setShowSellAccessoryModal(false)
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    }, [isSuccess, hash]);


    return (
        <div className="fixed z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl inset-0">
            <div className="bg-purple-950/90 rounded-lg p-6 w-80 text-center">
                <div className="flex flex-col gap-2  mb-4">
                    <h2 className="text-lg font-mono text-white">
                        Pengo #{nftId}
                    </h2>
                    <p className="text-sm font-mono">
                        Sell {accessory.trait_name}
                    </p>
                    {sellPrice != 0 &&
                        <p className="text-sm font-mono">
                            for  {sellPrice} ETH
                        </p>
                    }
                </div>

                <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={sellPrice || 0 || Number(accessory.lastPrice)/1e18}
                    // onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                    onChange={(e) => setSellPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full text-sm p-2 border border-white bg-transparent text-white rounded"
                    placeholder="Enter price in ETH"
                />

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleSell}
                        className="w-full text-white text-xs font-mono border border-white py-2 px-2 hover:bg-blue-500/50 rounded-sm my-2"
                        disabled={isPending || isLoading}
                    >
                        {isPending || isLoading ? "Processing..." : `Sell`}
                    </button>
                    <button
                        onClick={() => setShowSellAccessoryModal(false)}
                        className="w-full text-white text-xs font-mono border border-white py-2 px-2 hover:bg-red-500/50 rounded-sm my-2"
                    >
                        Cancel
                    </button>
                </div>

                {/* {isSuccess && <p className="text-green-400 mt-2">Accessory listed successfully!</p>} */}
            </div>
        </div>
    );
};

export default SellAccessoryModal;
