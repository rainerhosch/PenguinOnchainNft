import { parseEther } from "viem";
import hre from "hardhat";

const POOL_SWAP_TEST_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "Currency", "name": "currency0", "type": "address" },
          { "internalType": "Currency", "name": "currency1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickSpacing", "type": "int24" },
          { "internalType": "contract IHooks", "name": "hooks", "type": "address" }
        ],
        "internalType": "struct PoolKey",
        "name": "key",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "bool", "name": "zeroForOne", "type": "bool" },
          { "internalType": "int256", "name": "amountSpecified", "type": "int256" },
          { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
        ],
        "internalType": "struct IPoolManager.SwapParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "bool", "name": "takeClaims", "type": "bool" },
          { "internalType": "bool", "name": "settleUsingBurn", "type": "bool" }
        ],
        "internalType": "struct PoolSwapTest.TestSettings",
        "name": "testSettings",
        "type": "tuple"
      },
      { "internalType": "bytes", "name": "hookData", "type": "bytes" }
    ],
    "name": "swap",
    "outputs": [
      { "internalType": "int256", "name": "delta", "type": "int256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];

const POOL_SWAP_TEST = "0x9b6b46e2c869aa39918db7f52f5557fe577b6eee";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  
  const poolKey = {
    currency0: '0x0000000000000000000000000000000000000000',
    currency1: '0xa4d68dAdE8FDa861207ce16aA83836B48bd59457',
    fee: 3000,
    tickSpacing: 60,
    hooks: '0x0000000000000000000000000000000000000000'
  } as const;

  const MAX_SQRT_PRICE = 1461446703485210103287273052203988822378723970342n;
  const MIN_SQRT_PRICE = 4295128739n;

  console.log("Simulating PoolSwapTest (zeroForOne=false) on network:", hre.network.name);
  try {
    const result = await publicClient.simulateContract({
      address: POOL_SWAP_TEST,
      abi: POOL_SWAP_TEST_ABI,
      functionName: 'swap',
      // no value needed when swapping token to ETH
      args: [
        poolKey,
        {
          zeroForOne: false,
          amountSpecified: -parseEther("1000000"), // Sell 1M PENGO
          sqrtPriceLimitX96: MAX_SQRT_PRICE - 1n // limit for zeroForOne=false
        },
        { takeClaims: false, settleUsingBurn: false },
        '0x'
      ]
    });
    const delta = result.result as bigint;
    
    let amount0 = delta >> 128n;
    if (amount0 >= (1n << 127n)) amount0 -= (1n << 128n);

    let amount1 = delta & ((1n << 128n) - 1n);
    if (amount1 >= (1n << 127n)) amount1 -= (1n << 128n);
    
    console.log("Delta:", delta);
    console.log("Amount0 (Received):", amount0);
    console.log("Amount1 (Paid):", amount1);
  } catch (error: any) {
    console.error("ERROR:", error.message);
  }
}

main().catch(console.error);
