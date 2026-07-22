import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("=========================================");
    console.log(`Hotfix: setPengoToken on ${network.name}`);
    console.log("=========================================");

    const [deployer] = await ethers.getSigners();
    console.log(`Executing with deployer account: ${deployer.address}`);

    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    
    const nftAddress = ecosystem.addresses.sepolia.PenguinOnchain;
    const pengoTokenAddress = ecosystem.addresses.sepolia.PengoToken;

    console.log(`NFT Address: ${nftAddress}`);
    console.log(`Token Address: ${pengoTokenAddress}`);

    const nft = await ethers.getContractAt([
        "function setPengoToken(address _pengoToken) external"
    ], nftAddress);
    
    console.log("Calling setPengoToken...");
    const tx = await nft.setPengoToken(pengoTokenAddress);
    await tx.wait();
    console.log("✅ Successfully set PengoToken!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
