'use client'

import React from "react";

type Accessory = {
    accessoryId: number;
    trait_name: string;
    trait_type: string;
    forSale: boolean;
    lastPrice: bigint;
    owner: string;
    sellingPrice: bigint;
};
interface SpecialTrait {
    category: string;
    networth: string;
}

interface AccessoryModalProps {
    accessories: Accessory[];
    // specialTrait: SpecialTrait;
    setSelectedAccessory: (accessory: Accessory) => void;
    setShowModal: (show: boolean) => void;
    setShowSellAccessoryModal: (show: boolean) => void;
}

const AccessoryModal: React.FC<AccessoryModalProps> = ({ 
    accessories, 
    // specialTrait, 
    setSelectedAccessory, 
    setShowModal, 
    setShowSellAccessoryModal 
}) => {
    return (
        <div className="fixed z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl inset-0">
            <div className="flex flex-col gap-2 bg-purple-950 rounded-lg p-4 justify-center pointer-events-auto w-3/4 sm:w-1/4">
                <h2 className="text-sm font-mono mb-2 text-center">Accessories</h2>
                {accessories.map((accessory) => (
                    <button
                        key={accessory.accessoryId}
                        disabled={accessory.forSale === true}
                        onClick={() => {
                            setSelectedAccessory(accessory);
                            setShowModal(false);
                            setShowSellAccessoryModal(true);
                        }}
                        className={`group flex flex-col bg-white/20 p-1 rounded-md ${
                            accessory.forSale !== true ? "hover:bg-blue-500" : "hover:bg-red-500"
                        } text-center text-xs font-mono`}
                    >
                        <div className="">
                            <div className="text-xs font-mono flex flex-col items-center">
                                <span className="group-hover:hidden">{accessory.trait_name}</span>
                                <span className="hidden group-hover:block">
                                    {accessory.forSale !== true ? `Sell ${accessory.trait_type}` : "Listed!"}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
                {/* <div className="flex flex-col gap-2 bg-white/10 rounded-md text-center">
                    <span className="text-xs font-mono text-white/50">Special trait: {specialTrait.category}</span>
                    <span className="text-xs font-mono text-white/50">Networth : {specialTrait.networth}</span>
                </div> */}
                <button onClick={() => setShowModal(false)} className="mt-4 border border-white hover:bg-red-500/50 text-white py-1 px-2 rounded text-xs font-mono">
                    Close
                </button>
            </div>
        </div>
    );
};

export default AccessoryModal;
