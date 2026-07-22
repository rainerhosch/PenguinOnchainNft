import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Checking Strategy state...");

    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    
    const strategyAddress = ecosystem.addresses.sepolia.PengoStrategyProxy;
    const nftAddress = ecosystem.addresses.sepolia.PenguinOnchain;
    
    const strategy = await ethers.getContractAt([
        "function getClaimableDividends(address rwaToken, uint256 tokenId) external view returns (uint256)",
        "function rewardTokens(uint256 index) external view returns (address)",
        "function rewardDebt(address rwa, uint256 tokenId) external view returns (uint256)",
        "function pendingDividends(address rwa, uint256 tokenId) external view returns (uint256)",
        "function totalDividendsPerPower(address rwa) external view returns (uint256)"
    ], strategyAddress);

    const nft = await ethers.getContractAt([
        "function sharePower(uint256 tokenId) external view returns (uint256)",
        "function ownerOf(uint256 tokenId) external view returns (address)",
        "function totalSupply() external view returns (uint256)"
    ], nftAddress);

    // try reading reward tokens
    let rwas = [];
    try {
        for (let i = 0; i < 10; i++) {
            rwas.push(await strategy.rewardTokens(i));
        }
    } catch(e) {}
    console.log("Reward Tokens:", rwas);

    const totalSupply = await nft.totalSupply();
    console.log("Total Supply:", totalSupply.toString());

    for (let i = 1; i <= Number(totalSupply); i++) {
        try {
            const owner = await nft.ownerOf(i);
            const power = await nft.sharePower(i);
            console.log(`Token ${i} | Owner: ${owner} | Power: ${power.toString()}`);
            
            for (const rwa of rwas) {
                const claimable = await strategy.getClaimableDividends(rwa, i);
                const debt = await strategy.rewardDebt(rwa, i);
                const pending = await strategy.pendingDividends(rwa, i);
                const totalDiv = await strategy.totalDividendsPerPower(rwa);
                console.log(`  RWA: ${rwa} | Claimable: ${claimable} | Debt: ${debt} | Pending: ${pending} | TotalDiv: ${totalDiv}`);
            }
        } catch(e) {}
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
