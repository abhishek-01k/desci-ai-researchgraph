require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    filecoinCalibration: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 314159,
      gasPrice: 1000000000,
      gas: 8000000,
    },
    flowEVMTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 545,
      gasPrice: 20000000000, // 20 gwei
      gas: 8000000,
    }
  }
};
