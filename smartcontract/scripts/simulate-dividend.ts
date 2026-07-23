import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const networkName = "sepolia"; // change if running on localhost
  const deploymentPath = path.join(__dirname, `../ignition/deployments/chain-11155111/deployed_addresses.json`);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found at ${deploymentPath}`);
  }

  const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const strategyAddress = deployedAddresses["PengoEcosystemV2#PengoStrategyProxy"];
  const mAAPLAddress = deployedAddresses["PengoEcosystemV2#MockAAPL"];
  const mGoldAddress = deployedAddresses["PengoEcosystemV2#MockGold"];
  const mGooglAddress = deployedAddresses["PengoEcosystemV2#MockGoogle"];
  const mNVidiaAddress = deployedAddresses["PengoEcosystemV2#MockNVIDIA"];
  // You can change this to mNVDA or UNI-V2
  const targetRwaAddress = mGooglAddress;

  if (!strategyAddress || !targetRwaAddress) {
    throw new Error("Missing addresses in deployment file");
  }

  console.log("=========================================");
  console.log("🐧 Simulating Dividend Distribution");
  console.log("=========================================");
  console.log("Strategy Address:", strategyAddress);
  console.log("RWA Token Address:", targetRwaAddress);

  const [signer] = await ethers.getSigners();
  console.log("Executing from:", signer.address);

  // 1. Setup Contracts
  const Strategy = await ethers.getContractAt("PengoStrategy", strategyAddress, signer);
  const RwaToken = await ethers.getContractAt("IERC20", targetRwaAddress, signer);

  // 2. Define amount to distribute (e.g., 50 RWA Tokens)
  const distributeAmount = ethers.parseEther("1000");

  console.log(`\n1. Approving ${ethers.formatEther(distributeAmount)} RWA Tokens to Strategy...`);
  const approveTx = await RwaToken.approve(strategyAddress, distributeAmount);
  await approveTx.wait();
  console.log("✅ Approval successful:", approveTx.hash);

  console.log(`\n2. Distributing Yield (transferring tokens and updating dividend math)...`);
  const distributeTx = await Strategy.distributeYield(targetRwaAddress, distributeAmount);
  await distributeTx.wait();
  console.log("✅ Yield distribution successful:", distributeTx.hash);

  console.log("\n🎉 Simulation Complete! Check the DApp to see Claimable Dividends updated.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Simulation failed:", error);
    process.exit(1);
  });
