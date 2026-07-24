import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🐧 Starting Pengo Trading Bot Simulation...");

  // Load addresses from PengoEcosystem.json
  const networkName = hre.network.name === "localhost" ? "hardhat" : hre.network.name;
  const ecosystemPath = path.join(__dirname, "..", "..", "dapp", "src", "constants", "PengoEcosystem.json");

  if (!fs.existsSync(ecosystemPath)) {
    console.error("❌ Error: PengoEcosystem.json not found. Have you deployed and synced?");
    process.exit(1);
  }

  const ecosystemData = JSON.parse(fs.readFileSync(ecosystemPath, "utf-8"));
  const addresses = ecosystemData.addresses[networkName];

  if (!addresses || !addresses.PengoBondingCurve || !addresses.PengoToken) {
    console.error(`❌ Error: Could not find addresses for network '${networkName}'.`);
    process.exit(1);
  }

  const bondingCurveAddress = addresses.PengoBondingCurve;
  const tokenAddress = addresses.PengoToken;

  console.log(`📍 Network: ${networkName}`);
  console.log(`📍 PengoBondingCurve: ${bondingCurveAddress}`);
  console.log(`📍 PengoToken: ${tokenAddress}`);

  // Setup Wallets
  const privateKey1 = process.env.WALLET1_KEY;
  const privateKey2 = process.env.WALLET2_KEY;

  if (!privateKey1 || !privateKey2) {
    console.error("❌ Error: WALLET1_KEY or WALLET2_KEY environment variables are missing.");
    console.error("Please provide them when running the script:");
    console.error("Example: WALLET1_KEY=0x... WALLET2_KEY=0x... npx hardhat run scripts/tradingBot.ts --network sepolia");
    process.exit(1);
  }

  const provider = hre.ethers.provider;
  const wallet1 = new hre.ethers.Wallet(privateKey1, provider);
  const wallet2 = new hre.ethers.Wallet(privateKey2, provider);

  console.log(`\n💼 Wallet 1: ${wallet1.address}`);
  console.log(`💼 Wallet 2: ${wallet2.address}`);

  // Check ETH Balances
  const bal1 = await provider.getBalance(wallet1.address);
  const bal2 = await provider.getBalance(wallet2.address);

  console.log(`💰 Wallet 1 ETH Balance: ${hre.ethers.formatEther(bal1)} ETH`);
  console.log(`💰 Wallet 2 ETH Balance: ${hre.ethers.formatEther(bal2)} ETH`);

  if (bal1 === 0n || bal2 === 0n) {
    console.error("❌ Error: One or both wallets have 0 ETH balance. They need ETH for gas and buying.");
    process.exit(1);
  }

  // Load Contracts
  const PengoBondingCurve = await hre.ethers.getContractAt("PengoBondingCurve", bondingCurveAddress);
  const PengoToken = await hre.ethers.getContractAt("PengoToken", tokenAddress);

  // Helper Function: Approve Token Spending
  const approveToken = async (wallet: any) => {
    const tokenContract = PengoToken.connect(wallet);
    const allowance = await tokenContract.allowance(wallet.address, bondingCurveAddress);
    //default  amount is 1000000000 = 100 pengo
    if (allowance < hre.ethers.parseEther("1000000000")) {
      console.log(`🔄 Wallet ${wallet.address.slice(0, 6)} approving PengoToken...`);
      const tx = await tokenContract.approve(bondingCurveAddress, hre.ethers.MaxUint256);
      await tx.wait();
      console.log(`✅ Approved!`);
    }
  };

  await approveToken(wallet1);
  await approveToken(wallet2);

  console.log("\n🚀 Starting Trading Simulation (Press Ctrl+C to stop)...\n");

  const minTradeAmount = parseFloat(process.env.MIN_TRADE_AMOUNT || "5587857");
  const maxTradeAmount = parseFloat(process.env.MAX_TRADE_AMOUNT || "71587857");

  const getRandomTradeAmount = () => {
    // Generate a random amount between min and max
    const randomAmount = Math.floor(Math.random() * (maxTradeAmount - minTradeAmount + 1)) + minTradeAmount;
    return randomAmount.toString();
  };

  let iteration = 1;
  while (true) {
    console.log(`\n--- 🔄 Iteration ${iteration} ---`);
    try {
      // 1. Wallet 1 Buys
      const tradeAmountStr1 = getRandomTradeAmount();
      const tradeAmountTokens1 = hre.ethers.parseEther(tradeAmountStr1);
      const costResult = await PengoBondingCurve.getCost(tradeAmountTokens1);
      const cost1 = costResult[0]; // totalCost is the first return value
      console.log(`🟢 Wallet 1 Buying ${tradeAmountStr1} PENGO (Cost: ${hre.ethers.formatEther(cost1)} ETH)...`);
      const txBuy1 = await PengoBondingCurve.connect(wallet1).buy(tradeAmountTokens1, { value: cost1 });
      await txBuy1.wait();
      console.log(`✅ Wallet 1 Buy Success! Hash: ${txBuy1.hash}`);

      // 2. Wallet 2 Sells (if it has tokens)
      const tradeAmountStr2 = getRandomTradeAmount();
      const tradeAmountTokens2 = hre.ethers.parseEther(tradeAmountStr2);
      const tokenBal2 = await PengoToken.balanceOf(wallet2.address);

      if (tokenBal2 >= tradeAmountTokens2) {
        console.log(`🔴 Wallet 2 Selling ${tradeAmountStr2} PENGO...`);
        const txSell2 = await PengoBondingCurve.connect(wallet2).sell(tradeAmountTokens2);
        await txSell2.wait();
        console.log(`✅ Wallet 2 Sell Success! Hash: ${txSell2.hash}`);
      } else {
        // If wallet 2 doesn't have tokens, it buys instead
        const costResult2 = await PengoBondingCurve.getCost(tradeAmountTokens2);
        const cost2 = costResult2[0];
        console.log(`🟢 Wallet 2 Buying ${tradeAmountStr2} PENGO (Cost: ${hre.ethers.formatEther(cost2)} ETH)...`);
        const txBuy2 = await PengoBondingCurve.connect(wallet2).buy(tradeAmountTokens2, { value: cost2 });
        await txBuy2.wait();
        console.log(`✅ Wallet 2 Buy Success! Hash: ${txBuy2.hash}`);
      }

      // 3. Wallet 1 Sells (Random chance to simulate chaos)
      if (Math.random() > 0.5) {
        const tokenBal1 = await PengoToken.balanceOf(wallet1.address);
        // Try to sell 50% of holding
        const sellAmount = tokenBal1 / 2n;
        if (sellAmount > 0n) {
          console.log(`🔴 Wallet 1 Randomly Selling ${hre.ethers.formatEther(sellAmount)} PENGO...`);
          const txSell1 = await PengoBondingCurve.connect(wallet1).sell(sellAmount);
          await txSell1.wait();
          console.log(`✅ Wallet 1 Sell Success! Hash: ${txSell1.hash}`);
        }
      }

    } catch (error: any) {
      console.error(`❌ Transaction failed during iteration ${iteration}:`, error.message);
    }

    iteration++;
    // Wait for 10 seconds before next iteration to avoid overwhelming RPC rate limits
    console.log("⏳ Waiting 10 seconds before next trades...");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
