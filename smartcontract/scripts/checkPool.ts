import hre from "hardhat";
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";

const POOL_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "PoolId", "name": "id", "type": "bytes32" }
    ],
    "name": "getSlot0",
    "outputs": [
      { "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" },
      { "internalType": "int24", "name": "tick", "type": "int24" },
      { "internalType": "uint24", "name": "protocolFee", "type": "uint24" },
      { "internalType": "uint24", "name": "lpFee", "type": "uint24" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const POOL_MANAGER = "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543";

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
  console.log("Pool ID:", poolId);

  try {
    const result = await publicClient.readContract({
      address: POOL_MANAGER,
      abi: POOL_MANAGER_ABI,
      functionName: 'getSlot0',
      args: [poolId]
    });
    console.log("Slot0:", result);
  } catch (error: any) {
    console.error("ERROR:", error.message);
  }
}

main().catch(console.error);
