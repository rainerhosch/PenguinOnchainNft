import { Wallet, Contract } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { vars } from "hardhat/config";

// An example of a script that will interact with an existing contract.
export default async function (hre: HardhatRuntimeEnvironment) {
    console.log(`Running withdrawl script`);

    // Initialize the wallet using your private key.
    const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));

    // Define the address of the deployed contract
    const pengoContractAddress = "0x96288DcEa56eD2E08c9DfD1cC018b8BCE4c92d28";

    // Load the contract artifact
    const artifactPengoNft = await hre.artifacts.readArtifact("PenguinOnchain");

    // Create a contract instance
    const pengoNftContract = new Contract(pengoContractAddress, artifactPengoNft.abi, wallet);

    // Interact with the contract
    await pengoNftContract.withdraw();
    console.log(`withdraw successful`);

    console.log("\n======================================================\n");
}
