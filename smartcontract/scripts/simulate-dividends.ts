import { ethers, upgrades } from "hardhat";

async function main() {
    const strategyProxyAddress = "0xeddc7614A6AC3a608ee0C6715443Ff9F11800b40";
    const mockAAPLAddress = "0x604D2b8e573696B6e02925C9A5a7E4F2eAe62569";
    const amountToDistribute = ethers.parseEther("1000000"); // 1M mAAPL

    const [deployer] = await ethers.getSigners();
    console.log("Using deployer:", deployer.address);

    // 1. Upgrade the Strategy to PengoStrategyTest
    console.log("Upgrading PengoStrategy to PengoStrategyTest...");
    const PengoStrategy = await ethers.getContractFactory("PengoStrategy");
    await upgrades.forceImport(strategyProxyAddress, PengoStrategy);
    const PengoStrategyTest = await ethers.getContractFactory("PengoStrategyTest");
    const upgradedStrategy = await upgrades.upgradeProxy(strategyProxyAddress, PengoStrategyTest);
    await upgradedStrategy.waitForDeployment();
    console.log("Strategy upgraded successfully.");

    // 2. Add MockAAPL to Buy List via backdoor
    console.log("Adding MockAAPL to Buy List...");
    const strategy = await ethers.getContractAt("PengoStrategyTest", strategyProxyAddress);
    
    const isAlreadyIn = await strategy.inBuyList(mockAAPLAddress);
    if (!isAlreadyIn) {
        const txAdd = await strategy.forceAddRWA(mockAAPLAddress);
        await txAdd.wait();
        console.log("MockAAPL added to Buy List!");
    } else {
        console.log("MockAAPL is already in Buy List.");
    }

    // 3. Approve Strategy to spend MockAAPL
    console.log(`Approving Strategy to spend MockAAPL...`);
    const mockAAPL = await ethers.getContractAt("MockRWA", mockAAPLAddress);
    
    console.log("Minting more MockAAPL to deployer...");
    const txMint = await mockAAPL.mint(deployer.address, amountToDistribute);
    await txMint.wait();

    const txApprove = await mockAAPL.approve(strategyProxyAddress, amountToDistribute);
    await txApprove.wait();
    console.log("Approval successful!");

    // 4. Distribute Yield
    console.log(`Distributing ${ethers.formatEther(amountToDistribute)} mAAPL as Yield...`);
    const txDist = await strategy.distributeYield(mockAAPLAddress, amountToDistribute);
    await txDist.wait();
    
    console.log("✅ Dividend simulation complete! You can now check the DApp UI.");
}

main().catch(console.error);
