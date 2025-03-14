'use client'
import React from "react";
// import { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import AppNavbar from "../../components/AppNavBar";
import PengosMintComponen from "../../components/mint/PengosMintComponeV2"

// const traits = [
//     { category: "Body Color", name: "Zombie", quantity: 300, percentage: "1.5%" },
//     { category: "Body Color", name: "Arctic", quantity: 700, percentage: "3.5%" },
//     { category: "Body Color", name: "Fire", quantity: 1500, percentage: "7.5%" },
//     { category: "Body Color", name: "Female", quantity: 8750, percentage: "43.75%" },
//     { category: "Body Color", name: "Male", quantity: 8750, percentage: "43.75%" },
//     { category: "Top Eye Color", name: "Zombie Eye", quantity: 300, percentage: "1.5%" },
//     { category: "Top Eye Color", name: "Ancestors", quantity: 985, percentage: "5%" },
//     { category: "Top Eye Color", name: "Sleepy", quantity: 1970, percentage: "10%" },
//     { category: "Top Eye Color", name: "Purple Shade", quantity: 5910, percentage: "30%" },
//     { category: "Top Eye Color", name: "Standard", quantity: 10835, percentage: "55%" },
// ];
const traits = [
    { category: "Body Color", name: "Zombie", percentage: "1.5%" },
    { category: "Body Color", name: "Arctic", percentage: "3.5%" },
    { category: "Body Color", name: "Fire", percentage: "7.5%" },
    { category: "Body Color", name: "Female", percentage: "43.75%" },
    { category: "Body Color", name: "Male", percentage: "43.75%" },
    { category: "Top Eye Color", name: "Zombie Eye", percentage: "1.5%" },
    { category: "Top Eye Color", name: "Ancestors", percentage: "5%" },
    { category: "Top Eye Color", name: "Sleepy", percentage: "10%" },
    { category: "Top Eye Color", name: "Purple Shade", percentage: "30%" },
    { category: "Top Eye Color", name: "Standard", percentage: "55%" },
];

export default function MintPage() {


    return (
        <div className="relative min-h-screen bg-[#9252ff] overflow-hidden">
            <AppNavbar />
            <Toaster
                position="bottom-right"
                reverseOrder={true}
                toastOptions={{
                    duration: 1000, // Set duration for the toast
                    // Add any other options to prevent multiple toasts
                }}
            />
            <main className="relative pt-24 pb-24 px-4 sm:px-4 sm:max-w-7.5xl mx-auto flex justify-center">
                <div className="flex flex-col content-center">
                    <div className="bg-transfarent rounded-lg shadow-lg p-6 mb-10">
                        <h1 className="text-2xl font-bold text-center mb-4 text-black">Mint Your Pengos</h1>
                        <PengosMintComponen />
                    </div>
                    <div className="flex flex-col px-5">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">DNA Traits Distribution</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-gray shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-[#301361]">
                                        <th className="py-2 px-4 text-left text-xs font-mono sm:text-base">Category</th>
                                        <th className="py-2 px-4 text-left text-xs font-mono sm:text-base">Trait</th>
                                        <th className="py-2 px-4 text-right text-xs font-mono sm:text-base">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {traits.map((trait, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                index % 2 === 0 ? "bg-purple-500" : "bg-purple-400"
                                            }
                                        >
                                            <td className=" px-4 text-xs font-mono sm:text-base text-sky-800">{trait.category}</td>
                                            <td className=" px-4 text-xs font-mono sm:text-base text-indigo-700">{trait.name}</td>
                                            <td className=" px-4 text-xs font-mono sm:text-base text-right text-yellow-900">{trait.percentage}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
};
