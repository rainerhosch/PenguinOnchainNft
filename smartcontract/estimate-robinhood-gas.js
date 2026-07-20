const fs = require('fs');
const https = require('https');

const alchemyUrl = 'https://robinhood-mainnet.g.alchemy.com/v2/08vne2jndkLeMxbs8GdFi6jtZrDfgBmB';
const deployer = '0xed6cf54e56d96af22bfb4d1e65fee9bcd311b5d9';

const factoryArtifact = require('./artifacts/contracts/utils/PengoFactory.sol/PengoFactory.json');
const penguinArtifact = require('./artifacts/contracts/ERC721/PenguinOnchain.sol/PenguinOnchain.json');

async function rpcCall(method, params) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: method,
            params: params
        });

        const req = https.request(alchemyUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(data)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log("Fetching current gas price on Robinhood Mainnet...");
    const gasPriceRes = await rpcCall('eth_gasPrice', []);
    const gasPriceWei = BigInt(gasPriceRes.result);
    console.log(`Gas Price: ${Number(gasPriceWei) / 1e9} gwei (${gasPriceWei} wei)`);

    console.log("\nEstimating PengoFactory deployment...");
    const factoryData = factoryArtifact.bytecode;
    const factoryRes = await rpcCall('eth_estimateGas', [{
        from: deployer,
        data: factoryData
    }]);
    
    if (factoryRes.error) {
        console.error("Error estimating PengoFactory:", factoryRes.error);
    } else {
        const factoryGas = BigInt(factoryRes.result);
        const costWei = factoryGas * gasPriceWei;
        console.log(`PengoFactory Gas Limit: ${factoryGas.toString(10)}`);
        console.log(`PengoFactory Cost: ${Number(costWei) / 1e18} ETH`);
    }

    console.log("\nEstimating PenguinOnchain deployment...");
    const penguinData = penguinArtifact.bytecode;
    const penguinRes = await rpcCall('eth_estimateGas', [{
        from: deployer,
        data: penguinData
    }]);
    
    if (penguinRes.error) {
        console.error("Error estimating PenguinOnchain:", penguinRes.error);
    } else {
        const penguinGas = BigInt(penguinRes.result);
        const costWei = penguinGas * gasPriceWei;
        console.log(`PenguinOnchain Gas Limit: ${penguinGas.toString(10)}`);
        console.log(`PenguinOnchain Cost: ${Number(costWei) / 1e18} ETH`);
    }
}

main().catch(console.error);
