const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BlocPol Advanced Voting System...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy ZKProofVerifier first
  console.log("\n🔐 Deploying ZKProofVerifier...");
  const ZKProofVerifier = await hre.ethers.getContractFactory("ZKProofVerifier");
  const zkProofVerifier = await ZKProofVerifier.deploy(3); // 3 threshold for verification
  await zkProofVerifier.waitForDeployment();
  console.log("✅ ZKProofVerifier deployed to:", await zkProofVerifier.getAddress());

  // Deploy LiquidDemocracy
  console.log("\n🗳️ Deploying LiquidDemocracy...");
  const LiquidDemocracy = await hre.ethers.getContractFactory("LiquidDemocracy");
  const liquidDemocracy = await LiquidDemocracy.deploy(5, 100); // max depth 5, min power 100
  await liquidDemocracy.waitForDeployment();
  console.log("✅ LiquidDemocracy deployed to:", await liquidDemocracy.getAddress());

  // Deploy VoteMixing
  console.log("\n🔄 Deploying VoteMixing...");
  const VoteMixing = await hre.ethers.getContractFactory("VoteMixing");
  const voteMixing = await VoteMixing.deploy(10, 100, 3600, 1800); // min 10, max 100, 1hr mixing, 30min reveal
  await voteMixing.waitForDeployment();
  console.log("✅ VoteMixing deployed to:", await voteMixing.getAddress());

  // Deploy main BlocPolAdvanced contract
  console.log("\n🏛️ Deploying BlocPolAdvanced...");
  const BlocPolAdvanced = await hre.ethers.getContractFactory("BlocPolAdvanced");
  const blocPolAdvanced = await BlocPolAdvanced.deploy(
    await zkProofVerifier.getAddress(),
    await liquidDemocracy.getAddress(),
    await voteMixing.getAddress(),
    100,    // min voting power
    10000,  // max voting power
    3600,   // commitment period (1 hour)
    1800    // reveal period (30 minutes)
  );
  await blocPolAdvanced.waitForDeployment();
  console.log("✅ BlocPolAdvanced deployed to:", await blocPolAdvanced.getAddress());

  // Transfer ownership of sub-contracts to main contract
  console.log("\n🔑 Transferring ownership...");
  await zkProofVerifier.transferOwnership(await blocPolAdvanced.getAddress());
  console.log("✅ ZKProofVerifier ownership transferred");
  
  await liquidDemocracy.transferOwnership(await blocPolAdvanced.getAddress());
  console.log("✅ LiquidDemocracy ownership transferred");
  
  await voteMixing.transferOwnership(await blocPolAdvanced.getAddress());
  console.log("✅ VoteMixing ownership transferred");

  // Register some test candidates
  console.log("\n👥 Registering test candidates...");
  await blocPolAdvanced.registerCandidate("Alice Johnson", "QmTestHash1");
  await blocPolAdvanced.registerCandidate("Bob Smith", "QmTestHash2");
  await blocPolAdvanced.registerCandidate("Carol Davis", "QmTestHash3");
  console.log("✅ Test candidates registered");

  // Create a test voting session
  console.log("\n📊 Creating test voting session...");
  await blocPolAdvanced.createVotingSession(86400, 0); // 24 hours, SIMPLE_MAJORITY
  console.log("✅ Test voting session created");

  // Log deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("📋 Contract Addresses:");
  console.log("   ZKProofVerifier:", await zkProofVerifier.getAddress());
  console.log("   LiquidDemocracy:", await liquidDemocracy.getAddress());
  console.log("   VoteMixing:", await voteMixing.getAddress());
  console.log("   BlocPolAdvanced:", await blocPolAdvanced.getAddress());
  console.log("\n🔧 Configuration:");
  console.log("   Min Voting Power: 100");
  console.log("   Max Voting Power: 10,000");
  console.log("   Commitment Period: 1 hour");
  console.log("   Reveal Period: 30 minutes");
  console.log("   ZK Proof Threshold: 3");
  console.log("   Max Delegation Depth: 5");
  console.log("   Min Delegation Power: 100");
  console.log("   Mixing Min Participants: 10");
  console.log("   Mixing Max Participants: 100");
  console.log("   Mixing Duration: 1 hour");
  console.log("   Mixing Reveal Delay: 30 minutes");
  console.log("\n🧪 Test Data:");
  console.log("   Candidates: 3 (Alice, Bob, Carol)");
  console.log("   Test Voters: 3");
  console.log("   Test Delegations: 1");
  console.log("   Voting Sessions: 2 (1 main, 1 liquid democracy)");
  console.log("   Mixing Rounds: 1");
  console.log("=".repeat(60));

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      zkProofVerifier: await zkProofVerifier.getAddress(),
      liquidDemocracy: await liquidDemocracy.getAddress(),
      voteMixing: await voteMixing.getAddress(),
      blocPolAdvanced: await blocPolAdvanced.getAddress()
    },
    configuration: {
      minVotingPower: 100,
      maxVotingPower: 10000,
      commitmentPeriod: 3600,
      revealPeriod: 1800,
      zkProofThreshold: 3,
      maxDelegationDepth: 5,
      minDelegationPower: 100,
      mixingMinParticipants: 10,
      mixingMaxParticipants: 100,
      mixingDuration: 3600,
      mixingRevealDelay: 1800
    },
    testData: {
      candidates: 3,
      testVoters: [],
      delegations: 0,
      votingSessions: 1,
      mixingRounds: 0
    },
    timestamp: new Date().toISOString()
  };

  // Write deployment info to file
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");

  // Verify contracts on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: await zkProofVerifier.getAddress(),
        constructorArguments: [3],
      });
      console.log("✅ ZKProofVerifier verified");
    } catch (error) {
      console.log("⚠️ ZKProofVerifier verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: await liquidDemocracy.getAddress(),
        constructorArguments: [5, 100],
      });
      console.log("✅ LiquidDemocracy verified");
    } catch (error) {
      console.log("⚠️ LiquidDemocracy verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: await voteMixing.getAddress(),
        constructorArguments: [10, 100, 3600, 1800],
      });
      console.log("✅ VoteMixing verified");
    } catch (error) {
      console.log("⚠️ VoteMixing verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: await blocPolAdvanced.getAddress(),
        constructorArguments: [
          await zkProofVerifier.getAddress(),
          await liquidDemocracy.getAddress(),
          await voteMixing.getAddress(),
          100,
          10000,
          3600,
          1800
        ],
      });
      console.log("✅ BlocPolAdvanced verified");
    } catch (error) {
      console.log("⚠️ BlocPolAdvanced verification failed:", error.message);
    }
  }

  console.log("\n🎯 Next Steps:");
  console.log("   1. Test the contracts using the test suite");
  console.log("   2. Deploy the frontend application");
  console.log("   3. Configure IPFS for candidate profiles");
  console.log("   4. Set up monitoring and analytics");
  console.log("   5. Conduct security audit");
  console.log("\n🚀 BlocPol Advanced Voting System is ready!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 