import { useState, useEffect } from 'react';

export function useEthPrice() {
    const [ethPrice, setEthPrice] = useState<number | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const data = await response.json();
                if (data.ethereum && data.ethereum.usd) {
                    setEthPrice(data.ethereum.usd);
                }
            } catch (error) {
                console.error("Failed to fetch ETH price", error);
            }
        };

        fetchPrice();
        // Update price every 60 seconds = 60000 ms 
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);
    // console.log(ethPrice)

    return ethPrice;
}
