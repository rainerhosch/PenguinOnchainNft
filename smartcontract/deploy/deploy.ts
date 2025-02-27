import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { vars } from "hardhat/config";
import { writeFileSync } from "fs";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
    console.log(`Running deploy script`);

    // Initialize the wallet using your private key.
    const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));

    // Create deployer object and load the artifact of the contract we want to deploy.
    const deployer = new Deployer(hre, wallet);

    const abs_explore = 'https://testnet.monadexplorer.com/';
    const monad_explore = 'https://testnet.monadexplorer.com/';

    // Load contract
    const artifactPixelCoordinate = await deployer.loadArtifact("PixelCoordinate");
    const pixelCoordinateContract = await deployer.deploy(artifactPixelCoordinate);
    const pixelCoordinateAddress = await pixelCoordinateContract.getAddress();

    console.log(
        `√ ${artifactPixelCoordinate.contractName
        } was deployed to ${pixelCoordinateAddress}`
    );
    
    console.log(`\n${monad_explore}address/${pixelCoordinateAddress}#code`);
    console.log("\n======================================================\n");
    // Load contract
    const artifactPengoFactory = await deployer.loadArtifact("PengoFactory");
    const pengoFactoryContract = await deployer.deploy(artifactPengoFactory, [pixelCoordinateAddress]);
    const pengofactoryAddress = await pengoFactoryContract.getAddress();

    console.log(
        `√ ${artifactPengoFactory.contractName
        } was deployed to ${pengofactoryAddress}`
    );
    
    console.log(`\n${monad_explore}address/${pengofactoryAddress}#code`);
    console.log("\n======================================================\n");

    const artifactPengoNft = await deployer.loadArtifact("PenguinOnchain");
    const pengoNftContract = await deployer.deploy(artifactPengoNft);
    const pengoContractAddress = await pengoNftContract.getAddress();
    console.log(
        `√ ${artifactPengoNft.contractName
        } was deployed to ${pengoContractAddress}`
    );
    console.log(`\n${monad_explore}address/${pengoContractAddress}#code`);
    console.log("\n======================================================\n");

    const artifactPengoDao = await deployer.loadArtifact("PengoDao");
    const pengoDaoContract = await deployer.deploy(artifactPengoDao, [pengoContractAddress]);
    const pengodaoAddress = await pengoDaoContract.getAddress();

    console.log(
        `√ ${artifactPengoDao.contractName
        } was deployed to ${pengodaoAddress}`
    );
    
    console.log(`\n${monad_explore}address/${pengodaoAddress}#code`);
    console.log("\n======================================================\n");

    await pengoNftContract.setFactory(pengofactoryAddress);
    console.log(`set factory address to:${pengofactoryAddress}`);

    console.log("\n======================================================\n");
    await pengoFactoryContract.setPengoContract(pengoContractAddress);
    console.log(`set nft contract for Factory to:${pengoContractAddress}`);

    console.log("\n======================================================\n");

    // Save deployment data to contract-info.json
    // const deployData = {
    //     contractAddresses: [{
    //         contract_name: artifactPengoFactory.contractName,
    //         contract_address: pengofactoryAddress,
    //     }, {
    //         contract_name: artifactPengoNft.contractName,
    //         contract_address: pengoContractAddress,
    //     }],
    //     network: hre.network.name,
    //     networkId: hre.network.config.chainId, // Added network id
    //     creatorAddress: wallet.address,
    // };

    // writeFileSync("contract-info.json", JSON.stringify(deployData, null, 2));
    // console.log("Deployment data saved to contract-info.json");
}
