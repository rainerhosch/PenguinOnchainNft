import PengoEcosystem from '../constants/PengoEcosystem.json';

// Define the supported network types based on the JSON structure
export type NetworkName = 'mainnet' | 'sepolia' | 'hardhat';

/**
 * Get the network name string corresponding to the chainId
 */
export function getNetworkName(chainId?: number): NetworkName {
    if (chainId === 1) return 'mainnet';
    if (chainId === 11155111) return 'sepolia';
    if (chainId === 31337) return 'hardhat';
    
    // Fallback to environment variable or default to sepolia for safety during transition
    const envDefault = process.env.NEXT_PUBLIC_DEFAULT_CHAIN;
    if (envDefault === 'mainnet') return 'mainnet';
    if (envDefault === 'hardhat') return 'hardhat';
    
    return 'sepolia';
}

/**
 * Get the contract addresses for the given network.
 * Falls back to zero addresses if the network block doesn't exist yet in the JSON.
 */
export function getAddresses(chainId?: number) {
    const network = getNetworkName(chainId);
    
    // Explicit type casting to help TypeScript understand the JSON structure
    const addresses = (PengoEcosystem.addresses as any)[network];
    
    // If the network block is missing (e.g., mainnet not deployed yet), return safe zero addresses
    if (!addresses) {
        console.warn(`[getAddresses] No addresses found for network: ${network}. Please update PengoEcosystem.json`);
        return {
            PengoToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            PengoStrategyProxy: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            PengoBondingCurve: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            MockAAPL: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            MockGold: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            MockGoogle: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            MockNVIDIA: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            PenguinOnchain: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            PengoFactory: "0x0000000000000000000000000000000000000000" as `0x${string}`
        };
    }
    
    return {
        PengoToken: addresses.PengoToken as `0x${string}`,
        PengoStrategyProxy: addresses.PengoStrategyProxy as `0x${string}`,
        PengoBondingCurve: addresses.PengoBondingCurve as `0x${string}`,
        MockAAPL: addresses.MockAAPL as `0x${string}`,
        MockGold: addresses.MockGold as `0x${string}`,
        MockGoogle: addresses.MockGoogle as `0x${string}`,
        MockNVIDIA: addresses.MockNVIDIA as `0x${string}`,
        PenguinOnchain: addresses.PenguinOnchain as `0x${string}`,
        PengoFactory: addresses.PengoFactory as `0x${string}`
    };
}

/**
 * Get the Uniswap V4 contract addresses for the given network.
 * Used by the Swap page after bonding curve migration to Uniswap V4.
 * 
 * PoolManager: Holds all V4 liquidity.
 * V4_QUOTER:   For reading swap quotes (off-chain simulation).
 * POOL_SWAP_TEST: Executes V4 swaps (official test helper; use UniversalRouter on mainnet when available).
 */
export function getV4DexAddresses(chainId?: number) {
    const network = getNetworkName(chainId);

    if (network === 'mainnet') {
        // Robinhood Chain — Official Uniswap V4 Deployments
        // Source: https://developers.uniswap.org/deployments?chain=Robinhood+Chain
        return {
            POOL_MANAGER:   "0x8366a39CC670B4001A1121B8F6A443A643e40951" as `0x${string}`,
            V4_QUOTER:      "0x8Dc178eFB8111BB0973Dd9d722ebeFF267c98F94" as `0x${string}`,
            UNIVERSAL_ROUTER: "0x8876789976decbfcbbbe364623c63652db8c0904" as `0x${string}`,
            PERMIT2:        "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`
        };
    }

    // Sepolia Testnet — Official Uniswap V4 Deployments
    // Source: https://developers.uniswap.org/docs/protocols/v4/deployments
    return {
        POOL_MANAGER:     "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543" as `0x${string}`,
        V4_QUOTER:        "0x61b3f2011a92d183c7dbadbda940a7555ccf9227" as `0x${string}`,
        UNIVERSAL_ROUTER: "0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b" as `0x${string}`,
        PERMIT2:          "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`
    };
}

/**
 * @deprecated Use getV4DexAddresses() for post-migration swap functionality.
 * This is kept only for reference — V2 Router is no longer used after bonding curve migration.
 */
export function getDexAddresses(chainId?: number) {
    const network = getNetworkName(chainId);
    
    if (network === 'mainnet') {
        return {
            ROUTER_ADDRESS: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" as `0x${string}`, // Official Mainnet V2 Router
            WETH_ADDRESS: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as `0x${string}` // Official Mainnet WETH
        };
    }
    
    // Sepolia (or fallback)
    return {
        ROUTER_ADDRESS: "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3" as `0x${string}`, // Router used in Sepolia Ignition deployment
        WETH_ADDRESS: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" as `0x${string}` // Sepolia WETH9
    };
}
