import { ethers, network, artifacts } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("=========================================");
    console.log(`Starting V3 Migration on ${network.name}`);
    console.log("=========================================");

    const [deployer] = await ethers.getSigners();
    console.log(`Executing with deployer account: ${deployer.address}`);

    // Load existing ecosystem config
    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    const contractPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoContract.json");
    
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    const proxyAddress = ecosystem.addresses.sepolia.PengoStrategyProxy;
    const pengoTokenAddress = ecosystem.addresses.sepolia.PengoToken;

    if (!proxyAddress || !pengoTokenAddress) {
        throw new Error("Missing PengoStrategyProxy or PengoToken in PengoEcosystem.json");
    }

    console.log(`Found Proxy Strategy: ${proxyAddress}`);
    console.log(`Found Pengo Token:    ${pengoTokenAddress}`);

    // 1. Deploy Factory
    console.log("\n1. Deploying PengoFactory...");
    const Factory = await ethers.getContractFactory("PengoFactory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log(`✅ PengoFactory deployed to: ${factoryAddress}`);

    // 2. Deploy NFT Contract
    console.log("\n2. Deploying PenguinOnchainTestnet...");
    const NFT = await ethers.getContractFactory("PenguinOnchainTestnet");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`✅ PenguinOnchainTestnet deployed to: ${nftAddress}`);

    // 3. Link Factory and NFT
    console.log("\n3. Linking Factory and NFT...");
    await (await factory.setPengoContract(nftAddress)).wait();
    console.log(`✅ PengoFactory.setPengoContract(${nftAddress})`);
    
    await (await nft.setFactory(factoryAddress)).wait();
    console.log(`✅ PenguinOnchainTestnet.setFactory(${factoryAddress})`);

    // 4. Upgrade Strategy Implementation
    console.log("\n4. Deploying new PengoStrategy implementation...");
    const StrategyImpl = await ethers.getContractFactory("PengoStrategy");
    const strategyImpl = await StrategyImpl.deploy();
    await strategyImpl.waitForDeployment();
    const implAddress = await strategyImpl.getAddress();
    console.log(`✅ New PengoStrategy Implementation deployed to: ${implAddress}`);

    console.log(`Upgrading Strategy Proxy (${proxyAddress}) to new implementation...`);
    const proxyContract = await ethers.getContractAt([
        "function upgradeTo(address newImplementation) external",
        "function setNftContract(address _nftContract) external",
        "function setPenguinContract(address _nftContract) external" // In case it existed previously
    ], proxyAddress);
    
    await (await proxyContract.upgradeTo(implAddress)).wait();
    console.log(`✅ Upgraded Proxy to implementation: ${implAddress}`);

    // 5. Link Proxy and NFT
    console.log("\n5. Updating Strategy and Token with new NFT address...");
    await (await proxyContract.setNftContract(nftAddress)).wait();
    console.log(`✅ PengoStrategy.setNftContract(${nftAddress})`);
    
    const pengoTokenContract = await ethers.getContractAt([
        "function setNftContract(address _nftContract) external"
    ], pengoTokenAddress);
    await (await pengoTokenContract.setNftContract(nftAddress)).wait();
    console.log(`✅ PengoToken.setNftContract(${nftAddress})`);

    await (await factory.setStrategyContract(proxyAddress)).wait();
    console.log(`✅ PengoFactory.setStrategyContract(${proxyAddress})`);
    
    await (await nft.setStrategyContract(proxyAddress)).wait();
    console.log(`✅ PenguinOnchainTestnet.setStrategyContract(${proxyAddress})`);

    await (await nft.setPengoToken(pengoTokenAddress)).wait();
    console.log(`✅ PenguinOnchainTestnet.setPengoToken(${pengoTokenAddress})`);

    // 6. Initialize Parts Coordinates
    console.log("\n6. Initializing Coordinates...");
    const part_name1 = "Top Wear";
    const part_data1 = "0d0b01010000000e0b01010000000f0b0101000000100b0101000000110b0101000000120b01010000000d0a01010000000e0901010000000f0901010000001009010100000011090101000000120a01010000000d0d01010000000d0c01010000000d09010100000012090101000000100a01010000000f0a01010000000e0801010000000e0701010000000f070101000000100701010000001107010100000011080101000000120c0101000000120d01010000000e0a0101000000110a01010000000f080101000000100801010000000c0d0101000000130d01010000000c0c01010000000c0b01010000000c0a01010000000c0901010000000d0801010000000c0801010000000c0701010000000d07010100000012070101000000130701010000001308010100000013090101000000130a0101000000130b0101000000130c01010000000e0c01010000000f0c0101000000100c0101000000110c010100000012080101000000";
    const part_name2 = "Body Wear";
    const part_data2 = "0c0e01010000000d0e01010000000e0f01010000000f100101000000130e0101000000120e0101000000110f0101000000101001010000000b0f01010000000b1001010000000a1001010000000b1101010000000b120101000000140f01010000001410010100000014110101000000151001010000001412010100000014130101000000131301010000001213010100000011130101000000101301010000000f1301010000000e1301010000000d1301010000000c1301010000000b1301010000000c1401010000000c1501010000000d1501010000000e1501010000000f15010100000010150101000000111501010000001215010100000013150101000000131401010000000c0f01010000000c1001010000000c1101010000000c1201010000000d1001010000000d0f01010000000d1101010000000d1201010000000d1401010000000e1001010000000e1101010000000e1201010000000e1401010000000f1201010000000f1101010000000f14010100000010140101000000111401010000001214010100000012120101000000121101010000001210010100000013100101000000130f010100000013110101000000131201010000001112010100000010120101000000101101010000001111010100000011100101000000120f01010000000a110101000000151101010000000b1401010000000b1501010000001414010100000014150101000000";
    const part_name3 = "Foot Wear";
    const part_data3 = "0d1601010000000e1601010000000e1701010000000d1701010000000c1701010000001116010100000011170101000000121701010000001216010100000013170101000000";
    const part_name4 = "Eye Wear";
    const part_data4 = "0d0c01010000000d0d01010000000d0e01010000000e0e01010000000f0e0101000000100e0101000000110e0101000000120e0101000000120d0101000000120c0101000000110c0101000000100c01010000000f0c01010000000e0c01010000000c0c0101000000130c01010000000e0d01010000000f0d0101000000100d0101000000110d0101000000";

    await (await factory.initializeCoordinates(part_name1, part_data1)).wait();
    await (await factory.initializeCoordinates(part_name2, part_data2)).wait();
    await (await factory.initializeCoordinates(part_name3, part_data3)).wait();
    await (await factory.initializeCoordinates(part_name4, part_data4)).wait();
    console.log("✅ Accessories parts data initialized!");

    // 7. Update Frontend Config Files
    console.log("\n7. Updating Frontend Configs...");
    
    // Update PengoEcosystem.json
    ecosystem.addresses.sepolia.PengoFactory = factoryAddress;
    ecosystem.addresses.sepolia.PenguinOnchain = nftAddress;
    
    // Fetch ABIs
    const penguinArtifact = await artifacts.readArtifact("PenguinOnchainTestnet");
    const factoryArtifact = await artifacts.readArtifact("PengoFactory");
    const strategyArtifact = await artifacts.readArtifact("PengoStrategy");
    
    ecosystem.abis.PenguinOnchain = penguinArtifact.abi;
    ecosystem.abis.PengoFactory = factoryArtifact.abi;
    ecosystem.abis.PengoStrategy = strategyArtifact.abi;

    fs.writeFileSync(ecosystemPath, JSON.stringify(ecosystem, null, 2));
    
    // Update PengoContract.json
    let contractJson = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
    contractJson.address = nftAddress;
    contractJson.factoryAddress = factoryAddress;
    
    let networkEntryIndex = contractJson.networkDeployment.findIndex((n: any) => n.chainId === "11155111");
    if (networkEntryIndex !== -1) {
        contractJson.networkDeployment[networkEntryIndex].PengoAddress = nftAddress;
        contractJson.networkDeployment[networkEntryIndex].factoryAddress = factoryAddress;
        contractJson.networkDeployment[networkEntryIndex].abi = penguinArtifact.abi;
    }
    fs.writeFileSync(contractPath, JSON.stringify(contractJson, null, 4));
    
    console.log(`✅ Updated PengoEcosystem.json and PengoContract.json!`);

    console.log("\n=========================================");
    console.log("🚀 MIGRATION COMPLETE! 🚀");
    console.log("=========================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
