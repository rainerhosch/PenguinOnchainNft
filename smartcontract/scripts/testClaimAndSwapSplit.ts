import hre from "hardhat";
import { execSync } from "child_process";

const PENGO_STRATEGY = "0x0B33a8D32F13959693922cbc0222CA95C116422a";
const PENGO_TOKEN = "0xa4d68dAdE8FDa861207ce16aA83836B48bd59457";

// Active Buy List RWAs based on previous info
const MOCK_AAPL = "0x3Eb0ae8F07B799A2F5db8E394F22ddd5109BDb32";
const MOCK_NVDA = "0x32F7c832Ac951A9BbDa92acce57e67549e161ad8";
const MOCK_GOOGL = "0x58f40ab12C2894818ce40019C7bb1BF3Bd36E3D4";

const ACTIVE_RWAS = [MOCK_AAPL, MOCK_NVDA, MOCK_GOOGL];

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing Claim and Split Swap with account:", deployer.address);

    const strategy = await hre.ethers.getContractAt("PengoStrategy", PENGO_STRATEGY);
    
    const ethAddress = hre.ethers.ZeroAddress;

    // Fetch Strategy's LP Token ID using Alchemy to bypass Sepolia limitations
    console.log("Fetching LP Token ID for strategy...");
    const url = "https://eth-sepolia.g.alchemy.com/v2/demo"; // Public demo key or env var if available
    
    // We already know from previous logs that the token ID is 37773. 
    // In a real scenario we'd do the RPC call, but for simplicity here:
    const tokenId = "37773";
    console.log("Using Token ID:", tokenId);

    // Make sure we have 3 tokens in active buy list. Wait, is active buy list length really 3 on chain?
    // Let's add them just to be absolutely sure.
    for (const rwa of ACTIVE_RWAS) {
        const inBuyList = await strategy.inBuyList(rwa);
        if (!inBuyList) {
            console.log(`Adding ${rwa} to active buy list...`);
            const addTx = await strategy.addRWA(rwa);
            await addTx.wait();
        }
    }
    
    // Wait, the strategy requires activeBuyList array to have these exactly.
    // Let's get the active buy list from contract
    const activeBuyList = [];
    let i = 0;
    while (true) {
        try {
            const token = await strategy.activeBuyList(i);
            activeBuyList.push(token);
            i++;
        } catch (e) {
            break;
        }
    }
    console.log("Active Buy List on-chain:", activeBuyList);

    const poolKeys = [];
    const limitPrices = [];

    // Construct PoolKeys matching the on-chain activeBuyList order
    const MIN_SQRT_PRICE = 4295128739n + 1n; // MIN_SQRT_RATIO + 1
    const MAX_SQRT_PRICE = 1461446703485210103287273052203988822378723970342n - 1n;

    for (const rwaToken of activeBuyList) {
        const rwaAddress = (rwaToken as string).toLowerCase();
        
        let c0, c1;
        let isZeroForOne = false;
        if (ethAddress.toLowerCase() < rwaAddress) {
            c0 = ethAddress;
            c1 = rwaAddress;
            isZeroForOne = true;
        } else {
            c0 = rwaAddress;
            c1 = ethAddress;
        }
        
        poolKeys.push({
            currency0: c0,
            currency1: c1,
            fee: 3000,
            tickSpacing: 60,
            hooks: hre.ethers.ZeroAddress
        });
        
        limitPrices.push((isZeroForOne ? MIN_SQRT_PRICE : MAX_SQRT_PRICE).toString());
    }

    console.log("Calling claimAndSwapForRWA with split...");
    
    let ethC0 = ethAddress;
    let ethC1 = PENGO_TOKEN;
    if (PENGO_TOKEN.toLowerCase() < ethAddress.toLowerCase()) {
        ethC0 = PENGO_TOKEN;
        ethC1 = ethAddress;
    }

    const tx = await strategy.claimAndSwapForRWA(
        tokenId,
        ethC0,
        ethC1,
        poolKeys,
        true, // isEthToRwa
        limitPrices
    );

    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Tx Hash:", receipt.hash);
    console.log("Successfully claimed and executed split swap for RWAs!");
}

main().catch(console.error);
