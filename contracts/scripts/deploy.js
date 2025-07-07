const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting ResearchGraph AI smart contract deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy ResearchIPNFT contract
  console.log("\n📄 Deploying ResearchIPNFT contract...");
  const ResearchIPNFT = await ethers.getContractFactory("ResearchIPNFT");
  const researchIPNFT = await ResearchIPNFT.deploy();
  await researchIPNFT.waitForDeployment();
  
  const nftAddress = await researchIPNFT.getAddress();
  console.log("✅ ResearchIPNFT deployed to:", nftAddress);

  // Deploy ResearchDAOSimple contract (optimized for Filecoin EVM)
  console.log("\n🏛️ Deploying ResearchDAOSimple contract...");
  const ResearchDAOSimple = await ethers.getContractFactory("ResearchDAOSimple");
  const researchDAO = await ResearchDAOSimple.deploy(nftAddress);
  await researchDAO.waitForDeployment();
  
  const daoAddress = await researchDAO.getAddress();
  console.log("✅ ResearchDAO deployed to:", daoAddress);

  // Both contracts deployed successfully!

  // Display deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("📄 ResearchIPNFT Address:", nftAddress);
  console.log("🏛️ ResearchDAO Address:   ", daoAddress);
  console.log("💰 Total Gas Used:        ", "~0.01 ETH (estimated)");
  console.log("🌐 Network:               ", (await ethers.provider.getNetwork()).name);
  console.log("=".repeat(60));
  
  // Save deployment addresses to file
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(), // Convert BigInt to string
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ResearchIPNFT: {
        address: nftAddress,
        constructorArgs: []
      },
      ResearchDAOSimple: {
        address: daoAddress,
        constructorArgs: [nftAddress]
      }
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployments.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📁 Deployment info saved to deployments.json");
  
  console.log("\n🔍 Next steps:");
  console.log("1. Verify contracts on Etherscan (if on mainnet/testnet)");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Fund DAO with initial tokens");
  console.log("4. Set up governance proposals");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
