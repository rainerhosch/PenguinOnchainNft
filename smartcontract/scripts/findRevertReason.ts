import hre from "hardhat";

const PENGO_STRATEGY = "0x0B33a8D32F13959693922cbc0222CA95C116422a";
const PENGO_TOKEN = "0xa4d68dAdE8FDa861207ce16aA83836B48bd59457";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const strategy = await hre.ethers.getContractAt("PengoStrategy", PENGO_STRATEGY);
    
    const ethAddress = hre.ethers.ZeroAddress;
    const tokenId = "37773";
    
    const activeBuyList = [];
    let i = 0;
    while (true) {
        try {
            const token = await strategy.activeBuyList(i);
            activeBuyList.push(token);
            i++;
        } catch (e) {
            break;
        }
    }

    const poolKeys = [];
    const limitPrices = [];

    for (const rwaToken of activeBuyList) {
        const rwaAddress = (rwaToken as string).toLowerCase();
        let c0, c1;
        if (ethAddress.toLowerCase() < rwaAddress) {
            c0 = ethAddress;
            c1 = rwaAddress;
        } else {
            c0 = rwaAddress;
            c1 = ethAddress;
        }
        poolKeys.push({
            currency0: c0,
            currency1: c1,
            fee: 3000,
            tickSpacing: 60,
            hooks: hre.ethers.ZeroAddress
        });
        limitPrices.push("0");
    }

    let ethC0 = ethAddress;
    let ethC1 = PENGO_TOKEN;
    if (PENGO_TOKEN.toLowerCase() < ethAddress.toLowerCase()) {
        ethC0 = PENGO_TOKEN;
        ethC1 = ethAddress;
    }

    console.log("Simulating tx to get revert reason...");
    try {
        await strategy.claimAndSwapForRWA.staticCall(
            tokenId,
            ethC0,
            ethC1,
            poolKeys,
            true, // isEthToRwa
            limitPrices
        );
        console.log("Static call succeeded?!");
    } catch (e: any) {
        console.log("Revert Reason:", e.reason || e.message);
    }
}

main().catch(console.error);
