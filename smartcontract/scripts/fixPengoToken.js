const { ethers } = require('hardhat');
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);
    const penguinOnchain = await ethers.getContractAt('PenguinOnchainTestnet', '0x636C6c11573f2A96950C498ecb0eB0Bd682e2540');
    console.log('Setting pengo token...');
    const tx = await penguinOnchain.setPengoToken('0x40dB3d5B672db7a49ce8810cD0b774c659135766');
    await tx.wait();
    console.log('Done!');
}
main().catch(console.error);
