import { parseEther } from "viem";
import hre from "hardhat";

const QUOTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              { "internalType": "Currency", "name": "currency0",   "type": "address" },
              { "internalType": "Currency", "name": "currency1",   "type": "address" },
              { "internalType": "uint24",   "name": "fee",         "type": "uint24"  },
              { "internalType": "int24",    "name": "tickSpacing", "type": "int24"   },
              { "internalType": "contract IHooks", "name": "hooks","type": "address" }
            ],
            "internalType": "struct PoolKey",
            "name": "poolKey",
            "type": "tuple"
          },
          { "internalType": "bool",    "name": "zeroForOne",  "type": "bool"    },
          { "internalType": "uint128", "name": "exactAmount", "type": "uint128" }, // Changed to uint128!
          { "internalType": "bytes",   "name": "hookData",    "type": "bytes"   }
        ],
        "internalType": "struct IQuoter.QuoteExactSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "quoteExactInputSingle",
    "outputs": [
      { "internalType": "uint256", "name": "amountOut",                 "type": "uint256" },
      { "internalType": "uint256", "name": "feeAfterAllHooks",          "type": "uint256" },
      { "internalType": "uint160", "name": "sqrtPriceX96After",         "type": "uint160" },
      { "internalType": "uint32",  "name": "initializedTicksCrossed",   "type": "uint32"  },
      { "internalType": "uint256", "name": "gasEstimate",               "type": "uint256" }
    ],
    "stateMutability": "nonpayable", // Or nonpayable/view? We'll see.
    "type": "function"
  }
];

const V4_QUOTER = "0x61B3f2011A92d183C7dbaDBdA940a7555Ccf9227";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  
  const poolKey = {
    currency0: '0x0000000000000000000000000000000000000000',
    currency1: '0xa4d68dAdE8FDa861207ce16aA83836B48bd59457',
    fee: 3000,
    tickSpacing: 60,
    hooks: '0x0000000000000000000000000000000000000000'
  } as const;

  console.log("Simulating Quoter on network:", hre.network.name);
  try {
    const result = await publicClient.simulateContract({
      address: V4_QUOTER,
      abi: QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [{
        poolKey,
        zeroForOne: true,
        exactAmount: parseEther("0.01"),
        hookData: '0x'
      }]
    });
    console.log("SUCCESS:", result.result);
  } catch (error: any) {
    console.log("REVERT CAUSE:", error.cause);
  }
}

main().catch(console.error);
