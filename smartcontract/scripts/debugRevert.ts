import { ethers } from "hardhat";

async function main() {
    const strategyProxyAddress = "0xeddc7614A6AC3a608ee0C6715443Ff9F11800b40";
    const mockAAPLAddress = "0x604D2b8e573696B6e02925C9A5a7E4F2eAe62569";
    
    const strategy = await ethers.getContractAt("PengoStrategyTest", strategyProxyAddress);
    console.log("Checking owner...");
    const owner = await strategy.owner();
    console.log("Owner is:", owner);

    const [deployer] = await ethers.getSigners();
    console.log("Deployer is:", deployer.address);

    if (owner !== deployer.address) {
        console.error("Deployer is not the owner!");
    } else {
        try {
            console.log("Calling forceAddRWA statically...");
            await strategy.forceAddRWA.staticCall(mockAAPLAddress);
            console.log("Success statically!");
        } catch (e: any) {
            console.error("Revert reason:", e);
        }
    }
}
main().catch(console.error);
