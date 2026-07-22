import { ethers } from "hardhat";
async function main() {
    const s = await ethers.getContractAt('PengoStrategy', '0xeddc7614A6AC3a608ee0C6715443Ff9F11800b40');
    console.log('Owner is:', await s.owner());
}
main();
