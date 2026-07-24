import hre from "hardhat";

const PENGO_STRATEGY_PROXY = "0x0B33a8D32F13959693922cbc0222CA95C116422a";
const POOL_MANAGER = "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543";
const POSITION_MANAGER = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";
const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const POOL_SWAP_TEST = "0x9b6b46e2c869aa39918db7f52f5557fe577b6eee";

const MOCK_RWAS = [
    { symbol: "mAAPL", address: "0x3Eb0ae8F07B799A2F5db8E394F22ddd5109BDb32" },
    { symbol: "mNVDA", address: "0x32F7c832Ac951A9BbDa92acce57e67549e161ad8" },
    { symbol: "mGOLD", address: "0x1A77502FF5c2bE072AcB46a4b152b4eC0030DDaA" },
    { symbol: "mGOOGL", address: "0x58f40ab12C2894818ce40019C7bb1BF3Bd36E3D4" }
];

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Upgrading and Initializing with account:", deployer.address);

    // 1. Upgrade PengoStrategy
    console.log("\nDeploying new PengoStrategy implementation...");
    const StrategyFactory = await hre.ethers.getContractFactory("PengoStrategy");
    const newStrategyImpl = await StrategyFactory.deploy();
    await newStrategyImpl.waitForDeployment();
    const implAddr = await newStrategyImpl.getAddress();
    console.log("New Implementation deployed to:", implAddr);

    // Get ProxyAdmin to upgrade (OpenZeppelin standard)
    // Wait, since we used hardhat-ignition UUPS or just normal UUPS?
    // PengoStrategy is a UUPS proxy. So we just call `upgradeTo` on the proxy itself!
    console.log("Upgrading UUPS Proxy...");
    const strategyProxy = await hre.ethers.getContractAt("PengoStrategy", PENGO_STRATEGY_PROXY);
    const upgradeTx = await strategyProxy.upgradeTo(implAddr);
    await upgradeTx.wait();
    console.log("Strategy Upgraded successfully!");

    // Set PoolSwapTest
    console.log("Setting PoolSwapTest in Strategy...");
    const setTx = await strategyProxy.setPoolSwapTest(POOL_SWAP_TEST);
    await setTx.wait();
    console.log("PoolSwapTest configured.");

    // 2. Deploy MockRWAInitializer
    console.log("\nDeploying MockRWAInitializer...");
    const InitializerFactory = await hre.ethers.getContractFactory("MockRWAInitializer");
    const initializer = await InitializerFactory.deploy(POOL_MANAGER, POSITION_MANAGER, PERMIT2);
    await initializer.waitForDeployment();
    const initAddr = await initializer.getAddress();
    console.log("Initializer deployed to:", initAddr);

    // 3. Initialize V4 Pools and Add Liquidity
    const ethAmountPerPool = hre.ethers.parseEther("0.005");
    const rwaAmount = hre.ethers.parseEther("100000000"); // 100 million

    for (const rwa of MOCK_RWAS) {
        console.log(`\nInitializing Pool for ${rwa.symbol}...`);
        
        // Mint 100M tokens to deployer if not already
        const tokenContract = await hre.ethers.getContractAt("MockRWA", rwa.address);
        const balance = await tokenContract.balanceOf(deployer.address);
        if (balance < rwaAmount) {
            console.log(`Minting ${hre.ethers.formatEther(rwaAmount)} ${rwa.symbol} to deployer...`);
            const mintTx = await tokenContract.mint(deployer.address, rwaAmount);
            await mintTx.wait();
        }
        
        const approveTx = await tokenContract.approve(initAddr, hre.ethers.MaxUint256);
        await approveTx.wait();

        // Init and Add Liquidity
        try {
            const initPoolTx = await initializer.initAndAddLiquidity(rwa.address, rwaAmount, { value: ethAmountPerPool });
            await initPoolTx.wait();
            console.log(`Successfully initialized V4 Pool for ${rwa.symbol} + Added 0.005 ETH Liquidity!`);
        } catch(e: any) {
            console.log(`Failed to init ${rwa.symbol} pool: ${e.message}`);
        }
    }
    
    console.log("\nAll Done!");
}

main().catch(console.error);
