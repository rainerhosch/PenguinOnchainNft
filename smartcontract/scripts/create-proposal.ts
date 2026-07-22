import { ethers } from "hardhat";

async function main() {
    const strategyAddress = "0xeddc7614A6AC3a608ee0C6715443Ff9F11800b40";
    const mockAAPLAddress = "0x604D2b8e573696B6e02925C9A5a7E4F2eAe62569";

    const strategy = await ethers.getContractAt([
        {
            "inputs": [
                { "internalType": "address", "name": "rwaToken", "type": "address" },
                { "internalType": "bool", "name": "isAdd", "type": "bool" }
            ],
            "name": "propose",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ], strategyAddress);

    console.log("Creating proposal to add MockAAPL to buy list...");
    const tx = await strategy.propose(mockAAPLAddress, true);
    await tx.wait();
    console.log("Proposal created! TX:", tx.hash);
}

main().catch(console.error);
