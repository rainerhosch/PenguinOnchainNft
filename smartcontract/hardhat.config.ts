import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { vars } from "hardhat/config";
import "@matterlabs/hardhat-zksync";
require("hardhat-gas-reporter");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        details: {
          yulDetails: {
            optimizerSteps: "u",
          },
        },
      }
    }
  },
  gasReporter: {
    enabled: true,       // Aktifkan gas reporter
    currency: "USD",     // Pilihan: USD, EUR, dll.
    gasPrice: 52,        // Harga gas (Gwei) untuk estimasi biaya
    coinmarketcap: vars.get("CMC_API_KEY"),   // API Key (opsional) untuk menampilkan harga gas secara real-time
    outputFile: "gas-report.txt", // Simpan hasil ke file (opsional)
    noColors: false,     // Hapus warna terminal jika ingin output bersih
  },
  defaultNetwork: "sepolia",
  networks: {
    monadTestnet: {
      url: vars.get("MONAD_RPC_URL"),
      accounts: [vars.get("PRIVATE_KEY")],
      chainId: Number(vars.get("MONAD_CHAIN_ID")),
    },
    sepolia: {
      // url: vars.get("INFURA_SEPOLIA_URI"),
      url: vars.get("ALCHEMY_SEPOLIA_URI"),
      accounts: [vars.get("PRIVATE_KEY")],
      chainId: 11155111, // Sepolia's chain ID
      timeout: 120000, // Perpanjang timeout
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
    }
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com"
  },
  etherscan: {
    enabled: false
  },
};

export default config;
