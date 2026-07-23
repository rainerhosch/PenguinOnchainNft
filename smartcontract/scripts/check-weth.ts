import { ethers } from "hardhat";

async function main() {
    const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
    const abi = ["function WETH() external pure returns (address)"];
    const router = await ethers.getContractAt(abi, routerAddress);
    const weth = await router.WETH();
    console.log("ROUTER_WETH=" + weth);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
