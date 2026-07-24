import hre from "hardhat";

const PENGO_STRATEGY_PROXY = "0x0B33a8D32F13959693922cbc0222CA95C116422a";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Upgrading PengoStrategy with account:", deployer.address);

    console.log("\nDeploying new PengoStrategy implementation...");
    const StrategyFactory = await hre.ethers.getContractFactory("PengoStrategy");
    const newStrategyImpl = await StrategyFactory.deploy();
    await newStrategyImpl.waitForDeployment();
    const implAddr = await newStrategyImpl.getAddress();
    console.log("New Implementation deployed to:", implAddr);

    console.log("Upgrading UUPS Proxy...");
    const strategyProxy = await hre.ethers.getContractAt("PengoStrategy", PENGO_STRATEGY_PROXY);
    const upgradeTx = await strategyProxy.upgradeTo(implAddr);
    await upgradeTx.wait();
    console.log("Strategy Upgraded successfully!");
}

main().catch(console.error);
