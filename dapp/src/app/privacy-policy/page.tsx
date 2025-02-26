"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/NavBar";
import NavbarMobile from "../../components/Footer";

export default function PrivacyPolicyPage() {
    const [isAtTop, setIsAtTop] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const handleScroll = () => {
        if (window.scrollY > 0) {
            setIsAtTop(false);
            setShowBackToTop(true);
        } else {
            setIsAtTop(true);
            setShowBackToTop(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-black overflow-hidden">
            {/* Navigation */}
            {isAtTop && <Navbar />}

            {/* Main Content */}
            <main className="relative pt-24 pb-24 sm:px-2 max-w-4xl mx-auto">
                <div className="bg-black backdrop-blur-sm rounded-xl p-6 sm:p-8 text-white">
                    <h1 className="text-3xl font-bold mb-6 text-white text-center">Privacy Policy</h1>
                    
                    <div className="text-sm mb-6 text-center font-light">
                        <p>LAST UPDATED: November 5, 2024</p>
                        <p className="mt-2">This Privacy Policy was last updated on and is effective as of November 5, 2024.</p>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">1. Introduction</h2>
                            <p className="text-justify font-light">At Onchain Penguin, we prioritize your privacy and are dedicated to safeguarding your personal data. Our commitment to transparency and security is paramount as we strive to create a trustworthy environment for our users. This privacy policy outlines the comprehensive measures we take to collect, utilize, disclose, and protect your information while you engage with our NFT platform, where you can customize your penguin NFTs directly on-chain. We believe that understanding how your data is handled is essential to building a strong relationship with our clients, and we are here to ensure that your experience is both secure and rewarding.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">2. Information We Collect</h2>
                            <ul className="list-disc pl-6 space-y-2 text-justify font-light">
                                <li>
                                    <strong>Wallet Addresses:</strong> We collect your wallet addresses to facilitate transactions and ensure secure interactions on our platform.
                                </li>
                                <li>
                                    <strong>Transaction Data:</strong> This includes details of your NFT purchases, sales, and accessory minting activities, which help us maintain accurate records and improve our services.
                                </li>
                                <li>
                                    <strong>NFT Customization Activity:</strong> We track the NFTs you customize and trade, including timestamps and associated metadata, to enhance user experience and provide insights.
                                </li>
                                <li>
                                    <strong>Device Information:</strong> We gather information about the devices you use to access our platform, such as device type, operating system, and browser type, to optimize performance and security.
                                </li>
                                <li>
                                    <strong>Usage Data:</strong> This includes information on how you interact with our platform, such as pages visited, time spent, and features used, which helps us improve our services.
                                </li>
                                <li>
                                    <strong>Communication Preferences:</strong> We collect your preferences regarding communication methods and frequency to ensure we provide relevant updates and information.
                                </li>
                                <li>
                                    <strong>Settings:</strong> We store your account settings and preferences to enhance your user experience and provide personalized content.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">3. How We Use Your Information</h2>
                            <p className="text-justify font-light">We use the collected information to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-justify font-light">
                                <li>Facilitate the minting and trading of customizable accessories for your penguin NFTs</li>
                                <li>Improve our platform and user experience</li>
                                <li>Communicate with users about updates and services</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">4. Data Security</h2>
                            <p className="text-justify font-light">At Onchain Penguin, we take the security of your personal information very seriously. We implement a variety of appropriate technical and organizational measures to protect your data from unauthorized access, disclosure, alteration, and destruction. These measures include encryption, firewalls, and secure server environments, which are designed to safeguard your information in accordance with industry standards.</p>
                            <p className="text-justify font-light">Despite our efforts, it is important to acknowledge that no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure. As such, we encourage users to take their own precautions to protect their personal information, such as using strong passwords and keeping their login credentials confidential.</p>
                            <p className="text-justify font-light">For more information on data security best practices, we recommend reviewing resources from reputable organizations such as the National Institute of Standards and Technology (NIST) and the International Organization for Standardization (ISO). These organizations provide guidelines and frameworks that can help individuals and organizations enhance their data security measures.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">5. Your Rights</h2>
                            <p className="text-justify font-light">You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-justify font-light">
                                <li>Access your personal data</li>
                                <li>Request correction of your personal data</li>
                                <li>Request deletion of your personal data</li>
                                <li>Object to processing of your personal data</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">6. Changes to This Policy</h2>
                            <p className="text-justify font-light">We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the `Last Updated` date.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">7. Contact Us</h2>
                            <p className="text-justify font-light">If you have any questions about this privacy policy or our practices, please contact us at:</p>
                            <p className="mt-2 font-light">Email: privacy@penguinonchain.com</p>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            {isAtTop && <NavbarMobile />}

            {/* Back to Top Button */}
            {showBackToTop && (
                <button 
                    onClick={scrollToTop} 
                    className="fixed bottom-4 right-4 bg-white/30 text-white p-2 rounded-full shadow-lg hover:bg-white/15 transition"
                >
                    <span className="flex items-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
}
