import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import dotenv from "dotenv";
dotenv.config();

// This config is used exclusively for generating the mochawesome HTML test report.
// Run with: npx hardhat test --config hardhat.report.config.ts
//
// Output: test-results/test-report.html

const config: HardhatUserConfig = {
  solidity: "0.8.20",

  networks: {
    sepolia: {
      url: process.env.INFURA_URL!,
      accounts: [process.env.ADMIN_PRIVATE_KEY!],
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY!,
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=11155111&",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
    ],
  },

  gasReporter: {
    enabled: false,
  },

  mocha: {
    reporter: require.resolve("mochawesome"),
    reporterOptions: {
      reportDir: "test-results",
      reportFilename: "test-report",
      quiet: false,
      overwrite: true,
    },
  },
};

export default config;