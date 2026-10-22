const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ATTSLedger = await ethers.getContractFactory("ATTSLedger");
  const ledger = await ATTSLedger.deploy();
  await ledger.waitForDeployment();

  const address = await ledger.getAddress();
  console.log("ATTSLedger deployed to:", address);

  // Read ABI from artifacts
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ATTSLedger.sol/ATTSLedger.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Save to blockchain/deployment.json
  const deploymentData = { address, abi: artifact.abi };
  fs.writeFileSync(path.join(__dirname, "../deployment.json"), JSON.stringify(deploymentData, null, 2));

  // Copy to backend for easy access
  const backendPath = path.join(__dirname, "../../backend/src/blockchain");
  if (!fs.existsSync(backendPath)) fs.mkdirSync(backendPath, { recursive: true });
  fs.writeFileSync(path.join(backendPath, "deployment.json"), JSON.stringify(deploymentData, null, 2));

  console.log("Deployment saved to blockchain/deployment.json and backend/src/blockchain/deployment.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
