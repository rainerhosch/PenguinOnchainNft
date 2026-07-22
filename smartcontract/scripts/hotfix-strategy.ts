import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Adding historical RWAs...");

    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    const proxyAddress = ecosystem.addresses.sepolia.PengoStrategyProxy;

    const PengoStrategy = await ethers.getContractFactory("PengoStrategy");
    const proxyContract = PengoStrategy.attach(proxyAddress);

    const knownRWAs = [
        "0x6C91901C9509f6E35F38E22252a13b5D22b069df", // mGOOGL
        "0xa2717a61d1558E5E57cE8f58bB267793d5B5F37a"  // mNVDA
    ];

    for (const rwa of knownRWAs) {
        console.log(`Adding RWA ${rwa} to rewardTokens...`);
        try {
            const rwaAddress = ethers.getAddress(rwa.toLowerCase());
            const tx = await proxyContract.hotfixAddRewardToken(rwaAddress);
            await tx.wait();
            console.log(`✅ Added ${rwaAddress}`);
        } catch(e: any) {
            console.log(`Error adding ${rwa}:`, e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
