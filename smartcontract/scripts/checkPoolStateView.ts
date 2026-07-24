import hre from "hardhat";
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";

const STATE_VIEW_ABI = [
  {
    "inputs": [
      { "internalType": "PoolId", "name": "id", "type": "bytes32" }
    ],
    "name": "getLiquidity",
    "outputs": [
      { "internalType": "uint128", "name": "liquidity", "type": "uint128" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const STATE_VIEW = "0xe1dd9c3fa50edb962e442f60dfbc432e24537e4c";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  
  const encoded = encodeAbiParameters(
    parseAbiParameters('address, address, uint24, int24, address'),
    [
      '0x0000000000000000000000000000000000000000', 
      '0xa4d68dAdE8FDa861207ce16aA83836B48bd59457',
      3000,
      60,
      '0x0000000000000000000000000000000000000000'
    ]
  );
  const poolId = keccak256(encoded);

  try {
    const liquidity = await publicClient.readContract({
      address: STATE_VIEW,
      abi: STATE_VIEW_ABI,
      functionName: 'getLiquidity',
      args: [poolId]
    });
    console.log("StateView Liquidity:", liquidity);
  } catch (error: any) {
    console.error("ERROR:", error.message);
  }
}

main().catch(console.error);
