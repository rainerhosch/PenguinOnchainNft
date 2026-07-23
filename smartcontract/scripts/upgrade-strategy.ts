import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Upgrading strategy to include getRewardTokens and getActiveBuyList...");

    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    const proxyAddress = ecosystem.addresses.sepolia.PengoStrategyProxy;

    const PengoStrategy = await ethers.getContractFactory("PengoStrategy");
    const strategyImpl = await PengoStrategy.deploy();
    await strategyImpl.waitForDeployment();
    console.log(`✅ New PengoStrategy Implementation deployed to: ${await strategyImpl.getAddress()}`);
    
    console.log(`Upgrading Strategy Proxy (${proxyAddress}) to new implementation...`);
    const proxyContract = PengoStrategy.attach(proxyAddress);
    await (await proxyContract.upgradeTo(await strategyImpl.getAddress())).wait();
    console.log(`✅ Upgraded Proxy to implementation: ${await strategyImpl.getAddress()}`);
    
    // Update the ABI in PengoEcosystem.json to reflect the new getters
    const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "Strategy", "PengoStrategy.sol", "PengoStrategy.json");
    const strategyArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    
    ecosystem.abis.PengoStrategy = strategyArtifact.abi;
    fs.writeFileSync(ecosystemPath, JSON.stringify(ecosystem, null, 2));
    console.log(`✅ Updated PengoEcosystem.json with new ABI.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
