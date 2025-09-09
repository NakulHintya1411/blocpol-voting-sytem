const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlocPol Voting Contract", function () {
  let BlocPol, blocPol, owner, addr1, addr2;

  beforeEach(async function () {
    BlocPol = await ethers.getContractFactory("BlocPol");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    blocPol = await BlocPol.deploy();
    await blocPol.waitForDeployment();
  });

  it("Should set the right admin", async function () {
    expect(await blocPol.admin()).to.equal(owner.address);
  });

  it("Should allow admin to register candidates", async function () {
    await expect(blocPol.registerCandidate("Alice", "QmHash1"))
      .to.emit(blocPol, "CandidateRegistered");
    const candidates = await blocPol.getCandidates();
    expect(candidates.length).to.equal(1);
    expect(candidates[0].name).to.equal("Alice");
    expect(candidates[0].ipfsHash).to.equal("QmHash1");
  });

  it("Should not allow non-admin to register candidates", async function () {
    await expect(
      blocPol.connect(addr1).registerCandidate("Bob", "QmHash2")
    ).to.be.revertedWith("Only admin can perform this action");
  });

  it("Should start and stop voting session by admin", async function () {
    await blocPol.registerCandidate("Alice", "QmHash1");
    await expect(blocPol.startVotingSession(1000))
      .to.emit(blocPol, "VotingSessionStarted");
    expect(await blocPol.votingActive()).to.equal(true);
    await expect(blocPol.stopVotingSession())
      .to.emit(blocPol, "VotingSessionStopped");
    expect(await blocPol.votingActive()).to.equal(false);
  });

  it("Should allow voting only during active session and only once per address", async function () {
    await blocPol.registerCandidate("Alice", "QmHash1");
    await blocPol.startVotingSession(1000);
    await expect(blocPol.connect(addr1).vote(0))
      .to.emit(blocPol, "VoteCast");
    await expect(blocPol.connect(addr1).vote(0)).to.be.revertedWith("You have already voted");
    await blocPol.stopVotingSession();
    await expect(blocPol.connect(addr2).vote(0)).to.be.revertedWith("Voting is not active");
  });

  it("Should track total votes per candidate", async function () {
    await blocPol.registerCandidate("Alice", "QmHash1");
    await blocPol.registerCandidate("Bob", "QmHash2");
    await blocPol.startVotingSession(1000);
    await blocPol.connect(addr1).vote(0);
    await blocPol.connect(addr2).vote(1);
    expect(await blocPol.getTotalVotes(0)).to.equal(1n);
    expect(await blocPol.getTotalVotes(1)).to.equal(1n);
  });

  it("Should allow retrieval of vote hash and tx hash", async function () {
    await blocPol.registerCandidate("Alice", "QmHash1");
    await blocPol.startVotingSession(1000);
    await blocPol.connect(addr1).vote(0);
    const voteHash = await blocPol.getVoteHash(addr1.address);
    const txHash = await blocPol.getVoteTxHash(addr1.address);
    expect(voteHash).to.be.a('string');
    expect(txHash).to.be.a('string');
    expect(voteHash.length).to.equal(66); // 0x + 64 hex chars
    expect(txHash.length).to.equal(66);
  });

  it("Should return deployment timestamp", async function () {
    const ts = await blocPol.getDeploymentTimestamp();
    expect(ts).to.be.a('bigint');
    expect(ts).to.be.greaterThan(0n);
  });

  it("Should allow transparent but anonymous vote viewing", async function () {
    await blocPol.registerCandidate("Alice", "QmHash1");
    await blocPol.registerCandidate("Bob", "QmHash2");
    await blocPol.startVotingSession(1000);
    await blocPol.connect(addr1).vote(0);
    await blocPol.connect(addr2).vote(1);
    const votes = await blocPol.getAllVotes();
    expect(votes.length).to.equal(2);
    expect(Number(votes[0]) + Number(votes[1])).to.equal(2);
  });
}); 