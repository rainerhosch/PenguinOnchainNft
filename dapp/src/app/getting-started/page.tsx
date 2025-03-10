'use client'
import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';

const sections = [
    { id: "connect-wallet", title: "Connect Your Wallet", content: "Click the \"Connect Wallet\" button at the top right. Ensure you have a supported wallet like MetaMask or WalletConnect installed." },
    {
        id: "mint-pengo", title: "Mint Your Pengo", content: (
            <ol className="list-decimal list-inside space-y-2 text-justify">
                <li className='font-mono'>{`Connect your wallet by clicking the 'Connect Wallet' button.`}</li>
                <li className='font-mono'>Ensure you have enough $MON in your wallet to cover the minting fee.</li>
                <li className='font-mono'>Navigate to the minting page and select the desired Pengo NFT.</li>
                <li className='font-mono'>{`Click the 'Mint' button and confirm the transaction in your wallet.`}</li>
                <li className='font-mono'>Once the transaction is confirmed, your Pengo NFT will be added to your wallet, and now you can use studio, to draw some accessory.</li>
            </ol>
        )
    },
    {
        id: "customize-peng", title: "Customize Your Pengo", content: (
            <ol className="list-decimal list-inside space-y-2 text-justify">
                <li className='font-mono'>Use the studio to draw your own custom accessories for your Pengo.</li>
                <li className='font-mono'>You can also purchase accessories from the accessory marketplace, which unlock special traits based on the purchase price of the accessories. These traits accumulate if you buy more than one accessory.</li>
            </ol>
        )
    },
    {
        id: "accessory-marketplace", title: "Accessory Marketplace", content: (
            <div>
                <p className="text-justify">
                    Accessory Marketplace, is a vibrant hub where creativity meets commerce. Here, you can browse an extensive collection of unique NFTs that serve as accessories for your Pengo. Our marketplace is designed to cater to both collectors and creators, providing a platform to buy, sell, and trade rare collectibles that enhance your digital experience.
                </p>
                <p className="text-justify">
                    Explore a diverse range of accessories, from whimsical hats to intricate outfits, each crafted by talented artists from our community. Every item is a testament to creativity and innovation, ensuring that your Pengo stands out in the digital landscape. Whether you are looking to personalize your Pengo or seeking to invest in rare items, our marketplace offers something for everyone.
                </p>
                <p className="text-justify">
                    Additionally, our marketplace features a user-friendly interface that makes it easy to navigate through listings, view detailed descriptions, and connect with sellers. You can also take advantage of our trading options, allowing you to exchange accessories with other users, fostering a sense of community and collaboration.
                </p>
                <p className="text-justify">
                    Join us in the Accessory Marketplace and discover the endless possibilities to enhance your Pengo experience. Start your journey today by exploring the unique offerings and connecting with fellow enthusiasts!
                </p>
            </div>
        )
    },
    { id: "join-community", title: "Join the Community", content: "Join our Discord and follow us on Twitter for updates, events, and giveaways." },
    { id: "need-help", title: "Need Help?", content: "Visit our FAQ or contact our Support Team" }
];

const GettingStartedPage = () => {
    const [activeSection, setActiveSection] = useState(sections[0].id);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    return (
        <div className="flex flex-col h-screen bg-purple-600">
            {/* Mobile Menu Button */}
            <div className="block sm:hidden px-4 py-3 bg-purple-950">
                <button onClick={toggleMobileMenu} className="text-white">
                    <svg className={`h-5 w-5 ${isMobileMenuOpen ? 'open' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </>
                        )}
                    </svg>
                </button>
            </div>

            <div className='flex flex-col sm:flex-row'>
                {/* Sidebar */}
                <aside className={`fixed sm:relative h-screen w-60 sm:w-64 bg-purple-950 shadow-lg p-6 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}>
                    <h2 className="text-sm sm:text-xl font-bold mb-4 text-white">Getting Started</h2>
                    <nav>
                        <ul className="space-y-3 text-xs sm:text-sm">
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => {
                                            setActiveSection(section.id);
                                            setIsMobileMenuOpen(false); // Close menu on selection
                                        }}
                                        className={`w-full text-left p-2 rounded-xl ${activeSection === section.id ? 'bg-purple-600/40 text-white' : 'text-white/60 hover:bg-purple-800/40'}`}
                                    >
                                        {section.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-10 overflow-auto text-justify mx-6 sm:mx-12">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-50">{sections.find(s => s.id === activeSection)?.title}</h1>
                    <div className="text-purple-100 text-md sm:text-lg font-mono">
                        {sections.find(s => s.id === activeSection)?.content}
                    </div>
                </main>
            </div>
            {/* Floating Back to Home Button */}
            <a href="/" className="fixed bottom-8 right-8 p-2 bg-purple-400 border border-white text-white rounded-full shadow-lg hover:bg-purple-950 transition">
                <HomeIcon />
            </a>
        </div>
    );
};

export default GettingStartedPage;