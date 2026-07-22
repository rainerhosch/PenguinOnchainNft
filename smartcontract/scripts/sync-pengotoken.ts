import { ethers } from "hardhat";

async function main() {
    const nftAddress = "0xf33B1693c3CF6d2fF443dBFB6D78c8062fA3BAEE";
    const pengoTokenAddress = "0x66aE8918F72192a2B81557674743B4B7C76E6F3B";

    const nft = await ethers.getContractAt([
        "function pengoToken() external view returns (address)",
        "function setPengoToken(address _pengoToken) external"
    ], nftAddress);

    const currentToken = await nft.pengoToken();
    console.log("Current pengoToken in NFT contract:", currentToken);

    if (currentToken.toLowerCase() !== pengoTokenAddress.toLowerCase()) {
        console.log(`Mismatch! Updating pengoToken to ${pengoTokenAddress}...`);
        const tx = await nft.setPengoToken(pengoTokenAddress);
        await tx.wait();
        console.log("Updated successfully! TX:", tx.hash);
    } else {
        console.log("Already matched. No update needed.");
    }
}

main().catch(console.error);
