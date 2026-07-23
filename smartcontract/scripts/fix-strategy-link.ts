import { ethers } from 'hardhat';

async function main() {
  const onchain = await ethers.getContractAt('PenguinOnchainTestnet', '0xdB5785a7AF14B5948e10a36cfe6E18d9b59D4994');
  const tx = await onchain.setStrategyContract('0x09577c7D42e1b3D26Aecb0183EE7b37068044E60');
  await tx.wait();
  console.log('Strategy linked successfully!');
}

main().catch(console.error);
