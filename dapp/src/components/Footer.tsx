"use client";

export default function Footer() {
    return (
        <>
            <nav className="relative bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md">
                <div className="grid grid-cols-4 gap-1 p-2">
                    <a href="https://x.com/onchainpengo" target="_blank" className="flex flex-col items-center p-2 text-white hover:text-black ">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span className="text-xs mt-1">Twitter</span>
                    </a>

                    <a href="https://discord.gg/penguinonchain" target="_blank" className="flex flex-col items-center p-2 text-white hover:text-black ">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        <span className="text-xs mt-1">Discord</span>
                    </a>

                    <a href="https://luma.cube.com/penguinonchain" target="_blank" className="flex flex-col items-center p-2 text-white hover:text-black ">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13H4.5L12 6.5z"/>
                        </svg>
                        <span className="text-xs mt-1">Luma</span>
                    </a>

                    <a href="https://www.youtube.com/@penguinonchain" target="_blank" className="flex flex-col items-center p-2 text-white hover:text-black ">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122-2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span className="text-xs mt-1">YouTube</span>
                    </a>
                </div>

                <div className="text-center sm:font-semibold font-light text-white/60 text-xs py-4 space-y-2 border-t border-white/10">
                    <div className="space-x-4">
                        <a href="/privacy-policy" className="hover:text-black ">Privacy Policy</a>
                        <a href="/terms-of-service" className="hover:text-black ">Terms of Service</a>
                    </div>
                    <div>
                        © Copyright 2024 -- Penguin Onchain, Foundation. -- All Rights Reserved
                    </div>
                </div>
            </nav>
        </>
    );
}
