import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Checking Strategy state...");

    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    
    const strategyAddress = ecosystem.addresses.sepolia.PengoStrategyProxy;
    
    const strategy = await ethers.getContractAt([
        "function activeBuyList(uint256 index) external view returns (address)",
        "function inBuyList(address rwa) external view returns (bool)"
    ], strategyAddress);

    let activeList = [];
    try {
        for (let i = 0; i < 10; i++) {
            activeList.push(await strategy.activeBuyList(i));
        }
    } catch(e) {}
    console.log("Active Buy List:", activeList);
    
    const knownRWAs = [
        "0x604D2b8e573696B6e02925C9A5a7E4F2eAe62569",
        "0x128F31222E0DDE9EC4C3956a1A8D1c76294eb743",
        "0x6C91901C9509f6E35F38E22252a13b5D22b069df",
        "0xa2717a61d1558E5E57cE8f58bB267793d5B5F37a"
    ];
    for (const rwa of knownRWAs) {
        console.log(`inBuyList(${rwa}):`, await strategy.inBuyList(rwa));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
