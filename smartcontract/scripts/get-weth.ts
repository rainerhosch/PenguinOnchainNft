import { ethers } from "hardhat";

async function main() {
    const routerAddress = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
    const router = await ethers.getContractAt([
        {
            "inputs": [],
            "name": "WETH",
            "outputs": [
                { "internalType": "address", "name": "", "type": "address" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ], routerAddress);

    const weth = await router.WETH();
    console.log("WETH address from Router:", weth);
}

main().catch(console.error);
