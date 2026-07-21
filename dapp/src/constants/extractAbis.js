const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '../../../smartcontract/artifacts/contracts');
const deployedAddressesPath = path.join(__dirname, '../../../smartcontract/ignition/deployments/chain-11155111/deployed_addresses.json');
const dest = path.join(__dirname, 'PengoEcosystem.json');

const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));

const ecosystem = {
    addresses: {
        sepolia: {
            PengoToken: deployedAddresses['PengoEcosystemV2#PengoToken'],
            PengoStrategyProxy: deployedAddresses['PengoEcosystemV2#PengoStrategyProxy'],
            PengoBondingCurve: deployedAddresses['PengoEcosystemV2#PengoBondingCurve'],
            MockAAPL: deployedAddresses['PengoEcosystemV2#MockAAPL'],
            MockGold: deployedAddresses['PengoEcosystemV2#MockGold'],
            MockGoogle: deployedAddresses['PengoEcosystemV2#MockGoogle'],
            MockNVIDIA: deployedAddresses['PengoEcosystemV2#MockNVIDIA'],
            PenguinOnchain: deployedAddresses['PengoEcosystemV2#PenguinOnchainTestnet'],
            PengoFactory: deployedAddresses['PengoEcosystemV2#PengoFactory']
        }
    },
    abis: {
        PengoToken: JSON.parse(fs.readFileSync(path.join(contractsDir, 'ERC20/PengoToken.sol/PengoToken.json'))).abi,
        PengoStrategy: JSON.parse(fs.readFileSync(path.join(contractsDir, 'Strategy/PengoStrategy.sol/PengoStrategy.json'))).abi,
        PengoBondingCurve: JSON.parse(fs.readFileSync(path.join(contractsDir, 'ERC20/PengoBondingCurve.sol/PengoBondingCurve.json'))).abi,
        MockRWA: JSON.parse(fs.readFileSync(path.join(contractsDir, 'Mocks/MockRWA.sol/MockRWA.json'))).abi
    }
};

// Also update PengoContract.json with new NFT address
const pengoContractPath = path.join(__dirname, 'PengoContract.json');
const pengoContract = JSON.parse(fs.readFileSync(pengoContractPath, 'utf8'));
pengoContract.address = deployedAddresses['PengoEcosystemV2#PenguinOnchainTestnet'];
pengoContract.factoryAddress = deployedAddresses['PengoEcosystemV2#PengoFactory'];
fs.writeFileSync(pengoContractPath, JSON.stringify(pengoContract, null, 4));

fs.writeFileSync(dest, JSON.stringify(ecosystem, null, 2));
console.log("Successfully extracted ABIs to PengoEcosystem.json");
