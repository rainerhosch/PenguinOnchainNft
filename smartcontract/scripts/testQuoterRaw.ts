import { parseEther, encodeFunctionData } from "viem";
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
          { "internalType": "uint256", "name": "exactAmount", "type": "uint256" },
          { "internalType": "bytes",   "name": "hookData",    "type": "bytes"   }
        ],
        "internalType": "struct IQuoter.QuoteExactSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "quoteExactInputSingle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
          { "internalType": "uint128", "name": "exactAmount", "type": "uint128" },
          { "internalType": "bytes",   "name": "hookData",    "type": "bytes"   }
        ],
        "internalType": "struct IQuoter.QuoteExactSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "quoteExactInputSingleUint128",
    "outputs": [],
    "stateMutability": "nonpayable",
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

  try {
    const data256 = encodeFunctionData({
      abi: QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [{ poolKey, zeroForOne: true, exactAmount: parseEther("0.01"), hookData: '0x' }]
    });

    const data128 = encodeFunctionData({
      abi: QUOTER_ABI,
      functionName: 'quoteExactInputSingleUint128',
      args: [{ poolKey, zeroForOne: true, exactAmount: parseEther("0.01"), hookData: '0x' }]
    });

    console.log("Calling with uint256 exactAmount...");
    try {
      const res256 = await publicClient.call({
        to: V4_QUOTER,
        data: data256
      });
      console.log("Result 256:", res256.data);
    } catch (e: any) {
      console.log("Revert 256:", e.message);
    }

    console.log("Calling with uint128 exactAmount...");
    try {
      const res128 = await publicClient.call({
        to: V4_QUOTER,
        data: data128
      });
      console.log("Result 128:", res128.data);
    } catch (e: any) {
      console.log("Revert 128:", e.message);
    }

  } catch (error: any) {
    console.error("ERROR:", error.message);
  }
}

main().catch(console.error);
