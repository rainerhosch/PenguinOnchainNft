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

    const getBytecode = (path) => {
        try {
            const data = JSON.parse(fs.readFileSync(path, 'utf8'));
            return data.bytecode;
        } catch(e) {
            console.error("Could not read artifact at", path);
            return null;
        }
    };

    let totalCostWei = 0n;
    let totalGas = 0n;

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
            totalGas += factoryGas;
            totalCostWei += costWei;
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
            totalGas += penguinGas;
            totalCostWei += costWei;
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
            totalGas += strategyGas;
            totalCostWei += costWei;
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
    totalGas += proxyGas;
    totalCostWei += proxyCostWei;
    console.log(`ERC1967Proxy Gas Limit: ~${proxyGas.toString()} (Hardcoded estimate)`);
    console.log(`ERC1967Proxy Cost: ~${Number(proxyCostWei) / 1e18} ETH`);

    // 5. Estimate PengoToken
    console.log("\nEstimating PengoToken deployment...");
    const tokenBytecode = getBytecode('./artifacts/contracts/ERC20/PengoToken.sol/PengoToken.json');
    let tokenCostWei = 0n;
    if (tokenBytecode) {
        try {
            // Need constructor arguments for accuracy, but we can get a rough estimate using just bytecode
            // To be safe, hardcode or add 500k gas
            const tokenGas = 1200000n; // Hardcoded rough estimate
            tokenCostWei = tokenGas * gasPriceWei;
            totalGas += tokenGas;
            totalCostWei += tokenCostWei;
            console.log(`PengoToken Gas Limit: ~${tokenGas.toString()} (Hardcoded estimate)`);
            console.log(`PengoToken Cost: ~${Number(tokenCostWei) / 1e18} ETH`);
        } catch (e) {
            console.error("Error estimating PengoToken:", e.message);
        }
    }

    // 6. Estimate PengoBondingCurve
    console.log("\nEstimating PengoBondingCurve deployment...");
    const bondingBytecode = getBytecode('./artifacts/contracts/ERC20/PengoBondingCurve.sol/PengoBondingCurve.json');
    let bondingCostWei = 0n;
    if (bondingBytecode) {
        try {
            const bondingGas = 1500000n; // Hardcoded rough estimate
            bondingCostWei = bondingGas * gasPriceWei;
            totalGas += bondingGas;
            totalCostWei += bondingCostWei;
            console.log(`PengoBondingCurve Gas Limit: ~${bondingGas.toString()} (Hardcoded estimate)`);
            console.log(`PengoBondingCurve Cost: ~${Number(bondingCostWei) / 1e18} ETH`);
        } catch (e) {
            console.error("Error estimating PengoBondingCurve:", e.message);
        }
    }

    console.log("\n=================================");
    console.log(`TOTAL ESTIMATED GAS: ~${totalGas.toString()}`);
    console.log(`TOTAL ESTIMATED COST: ~${Number(totalCostWei) / 1e18} ETH`);
    console.log("=================================");
    console.log("NOTE: This script gives a rough bytecode estimate for some contracts.");
    console.log("For a 100% accurate simulation, run: npx hardhat compile && npx hardhat run scripts/estimate-robinhood-gas.js");
    console.log("=================================");
}

main().catch(console.error);
