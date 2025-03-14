import React from "react";
import { Toaster } from 'react-hot-toast';
import AppNavbar from "../../components/AppNavBar";
import ListItems from "../../components/accessory-marketplace/ListItems";

export default function AccessoryMarketplace() {
    return (
        <div className="relative min-h-screen bg-[#9252ff] overflow-hidden">
            <AppNavbar />
            <main className="relative pt-24 pb-24 px-4 sm:px-4 sm:max-w-7.5xl mx-auto flex justify-center">
                <div className="flex flex-col content-center">
                    <h1 className="text-2xl font-bold text-center my-4 text-white mx-10 animate-pulse transition duration-500 hover:text-purple-500">Accessory Marketplace</h1>
                    <ListItems />
                    <Toaster
                    position="bottom-right"
                    reverseOrder={true}
                    toastOptions={{
                        duration: 1000, // Set duration for the toast
                        // Add any other options to prevent multiple toasts
                    }}
                />
                </div>
            </main>
        </div>
    );
}
