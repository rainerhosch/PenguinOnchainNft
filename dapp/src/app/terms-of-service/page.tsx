"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/NavBar";
import NavbarMobile from "../../components/Footer";

export default function TermOfServicePage() {
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
                <div className="bg-black backdrop-blur-sm p-6 sm:p-8 text-white">
                    <h1 className="text-3xl font-bold mb-6 text-white text-center text-900">Terms of Service</h1>

                    <div className="text-sm mb-6 text-center font-light">
                        <p>LAST UPDATED: November 5, 2024</p>
                        <p className="mt-2">Please read these Terms of Service carefully before using our platform.</p>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
                            <p className="text-justify font-light">By accessing and using the Penguin Onchain platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (Terms), along with our Privacy Policy and any additional guidelines or rules applicable to specific services and features offered through our Platform. If you do not agree with any part of these terms, you must not use our services.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">2. NFT Customization and Accessories Trading</h2>
                            <p className="text-justify font-light">Our Platform facilitates the creation and customization of the first on-chain NFT character, Pengo. Users can draw and add unique assets directly on the provided canvas, enhancing their Pengo NFTs with personalized features. Users acknowledge and agree that:</p>
                            <ul className="list-disc pl-6 space-y-2 text-justify font-light mt-2">
                                <li>The value of customized assets can be highly volatile and may fluctuate significantly over time</li>
                                <li>We do not guarantee the future value, tradability, or liquidity of any assets</li>
                                <li>Users are solely responsible for conducting due diligence before engaging in any transactions</li>
                                <li>All transactions for buying and selling accessories are final and irreversible once confirmed on the blockchain</li>
                                <li>Users must comply with all applicable tax laws and regulations in their jurisdiction</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">3. User Responsibilities and Conduct</h2>
                            <p className="text-justify font-light">As a user of our Platform, you agree to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-justify font-light mt-2">
                                <li>Maintain the security and confidentiality of your wallet credentials and private keys</li>
                                <li>Provide accurate and complete information when using our services</li>
                                <li>Comply with all applicable laws, regulations, and tax requirements</li>
                                <li>Not engage in any fraudulent, manipulative, or deceptive activities</li>
                                <li>Not use the Platform for any illegal purposes or to violate the rights of others</li>
                                <li>Not attempt to circumvent any security measures or access unauthorized areas</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">4. Intellectual Property Rights</h2>
                            <p className="text-justify font-light">Penguin Onchain retains all rights, title, and interest in and to the Platform, including all content, features, and functionality. This includes, but is not limited to, all software, text, images, graphics, logos, patents, trademarks, service marks, copyrights, photographs, audio, videos, and music. Users are granted a limited, non-exclusive, non-transferable license to access and use the Platform for its intended purposes.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">5. Limitation of Liability</h2>
                            <p className="text-justify font-light">To the maximum extent permitted by law, Penguin Onchain and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for:</p>
                            <ul className="list-disc pl-6 space-y-2 text-justify font-light mt-2">
                                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Any loss of profits, revenue, data, or other intangible losses</li>
                                <li>Any damages resulting from unauthorized access to your account</li>
                                <li>Any interruption or cessation of transmission to or from the Platform</li>
                                <li>Any bugs, viruses, or other harmful components that may be transmitted</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">6. Modifications to Terms</h2>
                            <p className="text-justify font-light">We reserve the right to modify, amend, or update these Terms at any time at our sole discretion. Any changes will be effective immediately upon posting the updated Terms on our Platform. Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms. We will make reasonable efforts to notify users of any material changes through email or platform notifications.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">7. Contact Information</h2>
                            <p className="text-justify font-light">If you have any questions, concerns, or feedback regarding these Terms of Service, please contact our legal team at:</p>
                            <p className="mt-2 font-light">Email: legal@penguinonchain.com</p>
                            <p className="font-light">Address: Penguin Onchain, 123 Blockchain Street, Digital City, DC 12345</p>
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
