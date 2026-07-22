import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Distributing mock yield to test Net Worth and Dividends...");

    const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");
    let ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, "utf8"));
    const strategyAddress = ecosystem.addresses.sepolia.PengoStrategyProxy;

    const strategy = await ethers.getContractAt("PengoStrategy", strategyAddress);
    const [deployer] = await ethers.getSigners();
    
    console.log(`Using deployer: ${deployer.address}`);

    const knownRWAs = [
        { address: "0x604D2b8e573696B6e02925C9A5a7E4F2eAe62569", symbol: "mAAPL" },
        { address: "0x128F31222E0DDE9EC4C3956a1A8D1c76294eb743", symbol: "mGOLD" },
        { address: "0x6C91901C9509f6E35F38E22252a13b5D22b069df", symbol: "mGOOGL" },
        { address: "0xa2717a61d1558E5E57cE8f58bB267793d5B5F37a", symbol: "mNVDA" }
    ];

    const amountToDistribute = ethers.parseEther("1000"); // 1000 tokens each

    for (const rwa of knownRWAs) {
        console.log(`\nProcessing ${rwa.symbol} (${rwa.address})...`);
        try {
            const tokenAddress = ethers.getAddress(rwa.address.toLowerCase());
            
            // The tokens are standard ERC20. Let's attach.
            const token = await ethers.getContractAt([
                "function approve(address spender, uint256 amount) external returns (bool)",
                "function balanceOf(address account) external view returns (uint256)",
                "function mint(address to, uint256 amount) external"
            ], tokenAddress);

            const balance = await token.balanceOf(deployer.address);
            console.log(`Deployer balance of ${rwa.symbol}: ${ethers.formatEther(balance)}`);

            if (balance < amountToDistribute) {
                console.log(`Minting 10000 ${rwa.symbol} to deployer...`);
                try {
                    const txMint = await token.mint(deployer.address, ethers.parseEther("10000"));
                    await txMint.wait();
                    console.log(`✅ Minted!`);
                } catch(e:any) {
                    console.log(`Failed to mint. Error: ${e.message}`);
                }
            }

            console.log(`Approving strategy to spend ${rwa.symbol}...`);
            const txApprove = await token.approve(strategyAddress, amountToDistribute);
            await txApprove.wait();

            console.log(`Distributing 1000 ${rwa.symbol} to strategy...`);
            const txDistribute = await strategy.distributeYield(tokenAddress, amountToDistribute);
            await txDistribute.wait();
            
            console.log(`✅ Successfully distributed ${rwa.symbol}!`);
        } catch(e: any) {
            console.log(`❌ Error processing ${rwa.symbol}:`, e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
