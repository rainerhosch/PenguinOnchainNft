const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Pengo Ecosystem & Vault Strategy", function () {
  let PengoToken, pengoToken;
  let MockRWA, mockAAPL;
  let PenguinOnchainTestnet, nft;
  let PengoStrategy, strategyImpl, strategy;
  let PengoProxy;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // 1. Deploy Mock NFT
    PenguinOnchainTestnet = await ethers.getContractFactory("PenguinOnchainTestnet");
    nft = await PenguinOnchainTestnet.deploy();
    await nft.waitForDeployment();

    // 2. Deploy Pengo Token
    PengoToken = await ethers.getContractFactory("PengoToken");
    pengoToken = await PengoToken.deploy(ethers.parseEther("1000000")); // 1M tokens
    await pengoToken.waitForDeployment();

    // 3. Deploy Mock RWA
    MockRWA = await ethers.getContractFactory("MockRWA");
    mockAAPL = await MockRWA.deploy("Mock Apple", "mAAPL");
    await mockAAPL.waitForDeployment();

    // 4. Deploy Strategy Proxy (UUPS)
    PengoStrategy = await ethers.getContractFactory("PengoStrategy");
    strategyImpl = await PengoStrategy.deploy();
    await strategyImpl.waitForDeployment();

    const initData = strategyImpl.interface.encodeFunctionData("initialize", [await nft.getAddress()]);
    
    PengoProxy = await ethers.getContractFactory("PengoProxy");
    const proxy = await PengoProxy.deploy(await strategyImpl.getAddress(), initData);
    await proxy.waitForDeployment();

    strategy = PengoStrategy.attach(await proxy.getAddress());

    // 5. Setup
    await nft.setPengoToken(await pengoToken.getAddress());
    await pengoToken.setNftContract(await nft.getAddress());

    // Give user1 some ETH and PENGO
    await owner.sendTransaction({ to: user1.address, value: ethers.parseEther("1.0") });
    await pengoToken.transfer(user1.address, ethers.parseEther("1000"));
  });

  it("Should allow burning Pengo for Share Power", async function () {
    // User1 mints NFT (Mint price is 0.05 ETH)
    await nft.connect(user1).mintPengo(1, { value: ethers.parseEther("0.05") });
    
    const totalSupply = await nft.totalSupply();
    const tokenId = totalSupply - 1n; // Ethers v6 uses BigInt

    // Approve token burn
    await pengoToken.connect(user1).approve(await pengoToken.getAddress(), ethers.parseEther("100"));
    
    // User1 burns 100 PENGO for power
    await pengoToken.connect(user1).burnForPower(tokenId, ethers.parseEther("100"));

    const power = await nft.sharePower(tokenId);
    expect(power).to.equal(ethers.parseEther("100"));
  });

  it("Should allow proposing and voting with Share Power", async function () {
    await nft.connect(user1).mintPengo(1, { value: ethers.parseEther("0.05") });
    const tokenId = (await nft.totalSupply()) - 1n;

    await pengoToken.connect(user1).burnForPower(tokenId, ethers.parseEther("100"));

    // Propose
    await strategy.propose(await mockAAPL.getAddress(), true);

    // Vote
    await strategy.connect(user1).vote(1, tokenId, true);

    const proposal = await strategy.proposals(1);
    expect(proposal.yesVotes).to.equal(ethers.parseEther("100"));
  });

  it("Should execute proposal and distribute yield", async function () {
    await nft.connect(user1).mintPengo(1, { value: ethers.parseEther("0.05") });
    const tokenId = (await nft.totalSupply()) - 1n;
    await pengoToken.connect(user1).burnForPower(tokenId, ethers.parseEther("100"));

    await strategy.propose(await mockAAPL.getAddress(), true);
    await strategy.connect(user1).vote(1, tokenId, true);

    // Fast forward time by 4 days
    await ethers.provider.send("evm_increaseTime", [4 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await strategy.executeProposal(1);
    const inBuyList = await strategy.inBuyList(await mockAAPL.getAddress());
    expect(inBuyList).to.be.true;

    // Distribute yield
    await mockAAPL.mint(owner.address, ethers.parseEther("500"));
    await mockAAPL.approve(await strategy.getAddress(), ethers.parseEther("500"));
    await strategy.distributeYield(await mockAAPL.getAddress(), ethers.parseEther("500"));

    // Claim yield
    await strategy.connect(user1).claimDividends(await mockAAPL.getAddress(), tokenId);

    const balance = await mockAAPL.balanceOf(user1.address);
    expect(balance).to.equal(ethers.parseEther("500"));
  });
});
