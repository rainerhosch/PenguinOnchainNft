import hre from "hardhat";

const POOL_SWAP_TEST = "0x9b6b46e2c869aa39918db7f52f5557fe577b6eee";
const PENGO_TOKEN = "0xa4d68dAdE8FDa861207ce16aA83836B48bd59457";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Doing a swap with account:", deployer.address);

    const ethAddress = hre.ethers.ZeroAddress;
    let c0 = ethAddress;
    let c1 = PENGO_TOKEN;
    let zeroForOne = true;

    if (PENGO_TOKEN.toLowerCase() < ethAddress.toLowerCase()) {
        c0 = PENGO_TOKEN;
        c1 = ethAddress;
        zeroForOne = false;
    }

    const poolKey = {
        currency0: c0,
        currency1: c1,
        fee: 3000,
        tickSpacing: 60,
        hooks: hre.ethers.ZeroAddress
    };

    const swapTest = await hre.ethers.getContractAt("IPoolSwapTest", POOL_SWAP_TEST);

    const MIN_SQRT_PRICE = 4295128739n + 1n; // MIN_SQRT_RATIO + 1
    const MAX_SQRT_PRICE = 1461446703485210103287273052203988822378723970342n - 1n;
    
    const params = {
        zeroForOne: zeroForOne,
        amountSpecified: hre.ethers.parseEther("0.0001"), // swap 0.0001 ETH to PENGO
        sqrtPriceLimitX96: zeroForOne ? MIN_SQRT_PRICE : MAX_SQRT_PRICE
    };

    const testSettings = {
        takeClaims: false,
        settleUsingBurn: false
    };

    console.log("Swapping ETH for PENGO to generate fees...");
    const tx = await swapTest.swap(poolKey, params, testSettings, "0x", {
        value: hre.ethers.parseEther("0.0001")
    });

    await tx.wait();
    console.log("Swap done! Fees generated.");
}

main().catch(console.error);
