import hre from "hardhat";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  const txHash = "0xe78a57e6e227db7b8a1bac63f7d2085c41d8f718d74a80db18fe9045ebf5bfbc";
  
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });
    console.log("To:", receipt.to);
    console.log("Status:", receipt.status);
    console.log("Gas Used:", receipt.gasUsed);
    console.log("Tx From:", tx.from);
  } catch(e: any) {
    console.error(e.message);
  }
}

main().catch(console.error);
