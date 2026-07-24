import hre from "hardhat";

const POSITION_MANAGER = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";
const PENGO_STRATEGY = "0x0B33a8D32F13959693922cbc0222CA95C116422a";
const MOCK_AAPL = "0x3Eb0ae8F07B799A2F5db8E394F22ddd5109BDb32";
const BONDING_CURVE = "0xfc9a3eeb61b1de539f31b99a6d2e14df2714c7d8";

async function main() {
    console.log("Found Token ID via Alchemy: 37773");
    const strategyTokenId = 37773n;
    
    // Now call claimAndSwapForRWA
    console.log("Calling claimAndSwapForRWA...");
    const strategy = await hre.ethers.getContractAt("PengoStrategy", PENGO_STRATEGY);
    
    // PENGO / ETH pool currencies
    const pengoToken = "0xa4d68dAdE8FDa861207ce16aA83836B48bd59457";
    console.log("Pengo Token:", pengoToken);
    
    const ethAddress = hre.ethers.ZeroAddress;
    let c0 = ethAddress;
    let c1 = pengoToken;
    if (BigInt(c0) > BigInt(c1)) {
        c0 = pengoToken;
        c1 = ethAddress;
    }
    
    // RWA pool key
    const rwaToken = MOCK_AAPL; // Buy mAAPL
    let rwaC0 = ethAddress;
    let rwaC1 = rwaToken;
    if (BigInt(rwaC0) > BigInt(rwaC1)) {
        rwaC0 = rwaToken;
        rwaC1 = ethAddress;
    }
    
    const rwaPoolKey = {
        currency0: rwaC0,
        currency1: rwaC1,
        fee: 3000,
        tickSpacing: 60,
        hooks: hre.ethers.ZeroAddress
    };
    
    const isEthToRwa = true; // Use ETH fee to buy mAAPL
    const MIN_SQRT_PRICE = 4295128739n + 1n; // MIN_SQRT_RATIO + 1
    const MAX_SQRT_PRICE = 1461446703485210103287273052203988822378723970342n - 1n;
    const isZeroForOne = (rwaC0 === ethAddress);
    const limitPrice = isZeroForOne ? MIN_SQRT_PRICE : MAX_SQRT_PRICE;
    
    console.log("Parameters:", {
        tokenId: strategyTokenId.toString(),
        c0, c1, rwaToken, rwaPoolKey, isEthToRwa, limitPrice: limitPrice.toString()
    });
    
    try {
        const tx = await strategy.claimAndSwapForRWA(
            strategyTokenId, 
            c0, 
            c1,
            rwaToken,
            rwaPoolKey,
            isEthToRwa, 
            limitPrice, 
            {gasLimit: 3000000}
        );
        console.log("Tx Hash:", tx.hash);
        await tx.wait();
        console.log("Successfully claimed and swapped for RWA!");
    } catch(e: any) {
        console.log("Tx failed:", e.message);
    }
}

main().catch(console.error);
