import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { vars } from "hardhat/config";
import "@matterlabs/hardhat-zksync";
require("hardhat-gas-reporter");

function optionalVar(name: string, fallback = ""): string {
  try {
    return vars.get(name);
  } catch {
    return fallback;
  }
}

/**
 * Accepts either a full RPC URL or a bare Alchemy API key.
 * Invalid case (key only) caused: TypeError: Invalid URL
 */
function resolveSepoliaRpc(raw: string): string {
  const value = (raw || "").trim();
  if (!value) {
    return "https://rpc.sepolia.org";
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  // Bare Alchemy key → full Sepolia HTTPS endpoint
  return `https://eth-sepolia.g.alchemy.com/v2/${value}`;
}

function normalizePrivateKey(raw: string): string | undefined {
  const value = (raw || "").trim();
  if (!value) return undefined;
  return value.startsWith("0x") ? value : `0x${value}`;
}

const privateKey = normalizePrivateKey(optionalVar("PRIVATE_KEY"));
const sepoliaRpc = resolveSepoliaRpc(optionalVar("ALCHEMY_SEPOLIA_URI"));
const cmcKey = optionalVar("CMC_API_KEY");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 10,
    ...(cmcKey ? { coinmarketcap: cmcKey } : {}),
    outputFile: "gas-report.txt",
    noColors: false,
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    sepolia: {
      url: sepoliaRpc,
      accounts: privateKey ? [privateKey] : [],
      chainId: 11155111,
      timeout: 180000,
    },
  },
  sourcify: { enabled: true },
  etherscan: { enabled: false },
};

export default config;
