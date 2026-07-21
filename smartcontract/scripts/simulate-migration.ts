import { ethers, network, config } from "hardhat";
import PengoEcosystem from "../../dapp/src/constants/PengoEcosystem.json";

async function main() {
    // Get the Sepolia RPC URL from Hardhat's resolved configuration
    // @ts-ignore (networks.sepolia might not be explicitly typed but it exists)
    const sepoliaRpc = config.networks.sepolia?.url || "https://rpc.sepolia.org";

    console.log("Forking Sepolia network...");
    await network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl: sepoliaRpc,
                },
            },
        ],
    });

    console.log("Network forked successfully!");
    const [owner, buyer] = await ethers.getSigners();
    console.log("Test Buyer address:", buyer.address);
    console.log("Test Buyer ETH balance:", ethers.formatEther(await ethers.provider.getBalance(buyer.address)));

    const bondingCurveAddress = PengoEcosystem.addresses.sepolia.PengoBondingCurve;
    const tokenAddress = PengoEcosystem.addresses.sepolia.PengoToken;
    const strategyAddress = PengoEcosystem.addresses.sepolia.PengoStrategyProxy;
    const routerAddress = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008"; // Uniswap V2 Router on Sepolia
    const factoryAddress = "0x7E0987E5b3a30e3f2828572Bb659A548460a3003"; // Uniswap V2 Factory on Sepolia

    const BondingCurve = await ethers.getContractAt("PengoBondingCurve", bondingCurveAddress);
    const Token = await ethers.getContractAt("IERC20", tokenAddress);

    // Initial state
    console.log("Initial Contract ETH Balance:", ethers.formatEther(await ethers.provider.getBalance(bondingCurveAddress)));
    const targetLiquidity = await BondingCurve.TARGET_LIQUIDITY();
    console.log("Target Liquidity:", ethers.formatEther(targetLiquidity));
    console.log("Initial isMigrated:", await BondingCurve.isMigrated());

    let isMigrated = await BondingCurve.isMigrated();
    let iteration = 1;

    console.log("\n--- Starting Simulation ---");

    while (!isMigrated) {
        // Buy 50,000,000 PENGO each time to step through the curve faster
        const amountToBuy = ethers.parseEther("50000000");
        const cost = await BondingCurve.getCost(amountToBuy);

        console.log(`\n[Tx ${iteration}] Buying 50,000,000 PENGO for ${ethers.formatEther(cost)} ETH`);
        
        try {
            const tx = await BondingCurve.connect(buyer).buy(amountToBuy, { value: cost });
            await tx.wait();
        } catch (e: any) {
            console.error("Buy failed:", e.message);
            break;
        }

        const newBal = await ethers.provider.getBalance(bondingCurveAddress);
        console.log("New Contract ETH Balance:", ethers.formatEther(newBal));

        isMigrated = await BondingCurve.isMigrated();
        if (isMigrated) {
            console.log("\n===========================================");
            console.log("🎯 BOUNDING TARGET REACHED!");
            console.log("===========================================");
            console.log("=> Liquidity Migrated to Uniswap V2 successfully!");
            
            // Verify Pair Address
            const factoryAbi = ["function getPair(address,address) view returns (address)"];
            const factory = await ethers.getContractAt(factoryAbi, factoryAddress);
            
            const routerAbi = ["function WETH() view returns (address)"];
            const router = await ethers.getContractAt(routerAbi, routerAddress);
            const weth = await router.WETH();
            
            const pairAddress = await factory.getPair(tokenAddress, weth);
            console.log("✅ Uniswap V2 Pair Address Created:", pairAddress);
            
            if (pairAddress && pairAddress !== ethers.ZeroAddress) {
                const pair = await ethers.getContractAt("IERC20", pairAddress);
                const vaultBal = await pair.balanceOf(strategyAddress);
                console.log(`✅ LP Tokens deposited in Strategy Vault (${strategyAddress}):`, ethers.formatEther(vaultBal));
            } else {
                console.log("❌ Failed to find Pair address!");
            }
        }
        iteration++;
        
        // Safety break
        if (iteration > 30) {
            console.log("Max iterations reached.");
            break;
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
