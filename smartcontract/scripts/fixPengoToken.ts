import { ethers } from 'hardhat';

async function main() {
  const onchain = await ethers.getContractAt('PenguinOnchainTestnet', '0xdB5785a7AF14B5948e10a36cfe6E18d9b59D4994');
  const tx = await onchain.setPengoToken('0x89F1044f0d45b7e798F05e2f4A8372920d956e16');
  await tx.wait();
  console.log('Done!');
}

main().catch(console.error);
