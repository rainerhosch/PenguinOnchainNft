import fs from "fs";
import path from "path";
import hre from "hardhat";

async function main() {
  const chainId = hre.network.config.chainId;
  const networkName = hre.network.name;

  console.log(`Syncing DApp for network: ${networkName} (Chain ID: ${chainId})`);

  // 1. Read the deployed addresses from Ignition
  const deploymentDir = path.join(__dirname, "..", "ignition", "deployments", `chain-${chainId}`);
  const addressesFile = path.join(deploymentDir, "deployed_addresses.json");

  if (!fs.existsSync(addressesFile)) {
    console.error(`Error: Deployment file not found at ${addressesFile}`);
    console.error("Make sure you run the ignition deploy first.");
    process.exit(1);
  }

  const deployedAddresses = JSON.parse(fs.readFileSync(addressesFile, "utf-8"));
  
  // Support standard module, testnet module, and hotfix module names
  const factoryAddress = deployedAddresses["PenguinOnchainModule#PengoFactory"] || deployedAddresses["PenguinOnchainHotfix#PengoFactory"] || deployedAddresses["PengoEcosystemV2#PengoFactory"];
  const penguinAddress = deployedAddresses["PenguinOnchainModule#PenguinOnchain"] || deployedAddresses["PenguinOnchainModule#PenguinOnchainTestnet"] || deployedAddresses["PenguinOnchainHotfix#PenguinOnchain"] || deployedAddresses["PengoEcosystemV2#PenguinOnchainTestnet"];
  const daoAddress = deployedAddresses["PengoEcosystemV2#PengoStrategyProxy"];
  const pengoConverter = deployedAddresses["PengoEcosystemV2#PengoBondingCurve"];
  const pengoToken = deployedAddresses["PengoEcosystemV2#PengoToken"];

  if (!factoryAddress || !penguinAddress) {
    console.error("Could not find required addresses in deployed_addresses.json");
    process.exit(1);
  }

  // 2. Read the ABI from Artifacts
  const penguinArtifact = await hre.artifacts.readArtifact("PenguinOnchain");

  // 3. Update PengoContract.json
  const dappConstantsPath = path.join(__dirname, "..", "..", "dapp", "src", "constants");
  const contractJsonPath = path.join(dappConstantsPath, "PengoContract.json");
  const abiJsonPath = path.join(dappConstantsPath, "PengoAbi.json");

  let contractJson: any = {};
  if (fs.existsSync(contractJsonPath)) {
    contractJson = JSON.parse(fs.readFileSync(contractJsonPath, "utf-8"));
  }

  // Update root addresses
  contractJson.address = penguinAddress;
  contractJson.factoryAddress = factoryAddress;
  if (daoAddress) contractJson.daoAddress = daoAddress;
  if (pengoConverter) contractJson.pengoConverter = pengoConverter;
  if (pengoToken) contractJson.pengoTokenAddress = pengoToken;

  // Find or create the correct network deployment entry
  if (!contractJson.networkDeployment) {
    contractJson.networkDeployment = [];
  }

  let networkEntryIndex = contractJson.networkDeployment.findIndex((n: any) => n.chainId === String(chainId));
  
  if (networkEntryIndex === -1) {
    // If we are deploying to a new chain, append a new entry
    contractJson.networkDeployment.push({
      name: networkName === 'robinhood' ? 'Robinhood Chain' : networkName,
      chainId: String(chainId),
      currency: "ETH",
      explore: networkName === 'robinhood' ? "https://robinhoodchain.blockscout.com/" : "https://sepolia.etherscan.io/",
      PengoAddress: penguinAddress,
      factoryAddress: factoryAddress,
      daoAddress: daoAddress || "",
      pengoConverter: pengoConverter || "",
      pengoTokenAddress: pengoToken || "",
      abi: penguinArtifact.abi
    });
  } else {
    // Update existing entry
    contractJson.networkDeployment[networkEntryIndex].name = networkName === 'robinhood' ? 'Robinhood Chain' : networkName;
    contractJson.networkDeployment[networkEntryIndex].PengoAddress = penguinAddress;
    contractJson.networkDeployment[networkEntryIndex].factoryAddress = factoryAddress;
    if (daoAddress) contractJson.networkDeployment[networkEntryIndex].daoAddress = daoAddress;
    if (pengoConverter) contractJson.networkDeployment[networkEntryIndex].pengoConverter = pengoConverter;
    if (pengoToken) contractJson.networkDeployment[networkEntryIndex].pengoTokenAddress = pengoToken;
    contractJson.networkDeployment[networkEntryIndex].abi = penguinArtifact.abi;
  }

  // Write updated PengoContract.json
  fs.writeFileSync(contractJsonPath, JSON.stringify(contractJson, null, 4));
  console.log(`✅ Updated ${contractJsonPath} successfully!`);
  console.log(`   - PengoFactory: ${factoryAddress}`);
  console.log(`   - PenguinOnchain: ${penguinAddress}`);

  // 4. Update PengoAbi.json
  fs.writeFileSync(abiJsonPath, JSON.stringify(penguinArtifact.abi, null, 2));
  console.log(`✅ Updated ${abiJsonPath} successfully!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
