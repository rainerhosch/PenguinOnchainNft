import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    const proxyAddress = ecosystem.addresses.sepolia.PengoStrategyProxy;

    const strategy = await ethers.getContractAt([
        "function owner() external view returns (address)",
        "function hotfixAddRewardToken(address rwa) external"
    ], proxyAddress);
    
    const owner = await strategy.owner();
    console.log("Strategy Owner:", owner);

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
}

main().catch(console.error);
