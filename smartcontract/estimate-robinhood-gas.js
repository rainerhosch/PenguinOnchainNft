const { ethers } = require("ethers");
const fs = require('fs');

async function main() {
    console.log("Fetching current gas price on Robinhood Mainnet...");
    
    // We can use a custom provider if we want to query Robinhood specifically
    const provider = new ethers.JsonRpcProvider('https://robinhood-mainnet.g.alchemy.com/v2/08vne2jndkLeMxbs8GdFi6jtZrDfgBmB');
    
    let feeData;
    try {
        feeData = await provider.getFeeData();
    } catch (e) {
        console.log("Failed to connect to Robinhood RPC. Falling back to public ETH node for gas price just for testing, or aborting.");
        console.error(e.message);
        return;
    }
    
    const gasPriceWei = feeData.gasPrice || 2000000000n; // fallback to 2 gwei if empty
    console.log(`Gas Price: ${Number(gasPriceWei) / 1e9} gwei (${gasPriceWei} wei)`);

    const deployerAddress = '0xed6cf54e56d96af22bfb4d1e65fee9bcd311b5d9';

    // Helper to get bytecode from artifacts
    const getBytecode = (path) => {
        try {
            const data = JSON.parse(fs.readFileSync(path, 'utf8'));
            return data.bytecode;
        } catch(e) {
            console.error("Could not read artifact at", path);
            return null;
        }
    };

    // 1. Estimate PengoFactory
    console.log("\nEstimating PengoFactory deployment...");
    const factoryBytecode = getBytecode('./artifacts/contracts/utils/PengoFactory.sol/PengoFactory.json');
    if (factoryBytecode) {
        try {
            const factoryGas = await provider.estimateGas({
                from: deployerAddress,
                data: factoryBytecode
            });
            const costWei = factoryGas * gasPriceWei;
            console.log(`PengoFactory Gas Limit: ${factoryGas.toString()}`);
            console.log(`PengoFactory Cost: ${Number(costWei) / 1e18} ETH`);
        } catch (e) {
            console.error("Error estimating PengoFactory:", e.message);
        }
    }

    // 2. Estimate PenguinOnchain
    console.log("\nEstimating PenguinOnchain deployment...");
    const penguinBytecode = getBytecode('./artifacts/contracts/ERC721/PenguinOnchain.sol/PenguinOnchain.json');
    if (penguinBytecode) {
        try {
            const penguinGas = await provider.estimateGas({
                from: deployerAddress,
                data: penguinBytecode
            });
            const costWei = penguinGas * gasPriceWei;
            console.log(`PenguinOnchain Gas Limit: ${penguinGas.toString()}`);
            console.log(`PenguinOnchain Cost: ${Number(costWei) / 1e18} ETH`);
        } catch (e) {
            console.error("Error estimating PenguinOnchain:", e.message);
        }
    }

    // 3. Estimate PengoStrategy Implementation
    console.log("\nEstimating PengoStrategy (Implementation) deployment...");
    const strategyBytecode = getBytecode('./artifacts/contracts/Strategy/PengoStrategy.sol/PengoStrategy.json');
    if (strategyBytecode) {
        try {
            const strategyGas = await provider.estimateGas({
                from: deployerAddress,
                data: strategyBytecode
            });
            const costWei = strategyGas * gasPriceWei;
            console.log(`PengoStrategy Gas Limit: ${strategyGas.toString()}`);
            console.log(`PengoStrategy Cost: ${Number(costWei) / 1e18} ETH`);
        } catch (e) {
            console.error("Error estimating PengoStrategy:", e.message);
        }
    }

    // 4. Estimate ERC1967Proxy
    console.log("\nEstimating ERC1967Proxy deployment...");
    const proxyGas = 400000n; // Hardcoded fallback because it requires constructor arguments
    const proxyCostWei = proxyGas * gasPriceWei;
    console.log(`ERC1967Proxy Gas Limit: ~${proxyGas.toString()} (Hardcoded estimate)`);
    console.log(`ERC1967Proxy Cost: ~${Number(proxyCostWei) / 1e18} ETH`);
}

main().catch(console.error);
