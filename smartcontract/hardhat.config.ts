import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { vars } from "hardhat/config";
import "@matterlabs/hardhat-zksync";

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
