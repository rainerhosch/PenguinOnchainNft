import hre from "hardhat";

const POSITION_MANAGER = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";
const PENGO_STRATEGY = "0x0B33a8D32F13959693922cbc0222CA95C116422a"; 

async function main() {
    const publicClient = await hre.viem.getPublicClient();

    try {
        const balance = await publicClient.readContract({
            address: POSITION_MANAGER,
            abi: [{
                name: 'balanceOf',
                type: 'function',
                inputs: [{ name: 'owner', type: 'address' }],
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view'
            }],
            functionName: 'balanceOf',
            args: [PENGO_STRATEGY]
        });
        
        console.log("Strategy owns", balance, "LP NFTs");
        
        if (balance > 0n) {
            const tokenId = await publicClient.readContract({
                address: POSITION_MANAGER,
                abi: [{
                    name: 'tokenOfOwnerByIndex',
                    type: 'function',
                    inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
                    outputs: [{ name: '', type: 'uint256' }],
                    stateMutability: 'view'
                }],
                functionName: 'tokenOfOwnerByIndex',
                args: [PENGO_STRATEGY, 0n]
            });
            console.log("LP Token ID is:", tokenId);
        }
    } catch(e: any) {
        console.error(e.message);
    }
}

main().catch(console.error);
