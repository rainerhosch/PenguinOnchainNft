import hre from "hardhat";

const BONDING_CURVE_ABI = [
  {
    "inputs": [],
    "name": "poolManager",
    "outputs": [{ "internalType": "contract IPoolManager", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "positionManager",
    "outputs": [{ "internalType": "contract IPositionManager", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isMigrated",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Correct address from PengoEcosystem.json for Sepolia
const BONDING_CURVE_ADDRESS = "0x1D1A4Da62A9A6c8C020B4D10b52B29245eE4CCf2" as `0x${string}`;

async function main() {
  const publicClient = await hre.viem.getPublicClient();

  try {
    const isMigrated = await publicClient.readContract({
      address: BONDING_CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: 'isMigrated'
    });
    console.log("Is Migrated:", isMigrated);

    const poolManager = await publicClient.readContract({
      address: BONDING_CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: 'poolManager'
    });
    console.log("Pool Manager:", poolManager);

    const positionManager = await publicClient.readContract({
      address: BONDING_CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: 'positionManager'
    });
    console.log("Position Manager:", positionManager);

  } catch (error: any) {
    console.error("ERROR:", error.message);
  }
}

main().catch(console.error);
