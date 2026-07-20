# Penguin Onchain — Smart Contracts

EVM contracts for **Penguin Onchain**: fully on-chain ERC721A NFTs, accessory marketplace, and SVG/metadata generation via `PengoFactory`.

| Path | Role |
|------|------|
| `contracts/ERC721/PenguinOnchain.sol` | Main NFT (mint, accessories, offers) |
| `contracts/ERC721/PenguinOnchainTestnet.sol` | Testnet parameters (supply / price) |
| `contracts/utils/PengoFactory.sol` | On-chain SVG + `tokenURI` (structure preserved) |
| `contracts/governance/PengoDao.sol` | Optional DAO |
| `forge-test/` | Foundry unit + fuzz tests |
| `ignition/modules/` | Hardhat Ignition deploy modules |

---

## Upgrade summary (security, gas, tooling)

### Security (`PenguinOnchain` / Testnet)

- Mint **no longer drains** full contract balance (offer escrow protected).
- Mint pays only `amount * MINT_PRICE`; **refunds excess** payment.
- Correct **supply / per-wallet** checks (`+= amount`, not single `++`).
- Correct **token IDs** after batch mint (`_nextTokenId()` before mint).
- Fixed **remove accessory** trait clearing after storage delete.
- Fixed **approveOffer** accounting (memory copy before delete).
- Purchase / offers require **destination NFT ownership**.
- `PengoFactory.setPengoContract` is **`onlyOwner`**.
- Royalties use **`ROYALTY_ADDRESS`** (fallback owner).
- Custom errors for cheaper reverts.

### Gas

- Skip heavy `updateTraits` loops on fresh mints (default special traits).
- `calldata` args, unchecked loops, cached storage.
- **Solady** in factory: `Base64`, `LibString`, `DynamicBufferLib` for SVG/JSON assembly (public factory structure unchanged).
- Optimized `pengoConverter` hex/uint helpers.

### Tooling

- **Hardhat** (compile / Ignition deploy) + **Foundry** (unit + `testFuzz_*`).
- Config: `foundry.toml`, `remappings.txt`, `lib/forge-std`.

> **Note:** Logic changes require a **new deploy**. Existing addresses keep old bytecode until you redeploy and update the dapp ABI/addresses.

---

## Prerequisites

- **Node.js** 18+ and npm  
- **Foundry** (`forge`) — optional for fuzz tests  

```powershell
# Windows: Foundry binaries (if not on PATH)
# https://github.com/foundry-rs/foundry/releases
# Extract forge.exe to %USERPROFILE%\.foundry\bin and add to PATH
$env:Path = "$env:USERPROFILE\.foundry\bin;$env:Path"
forge --version
```

---

## Install

```powershell
cd smartcontract
npm install
# Foundry std (if lib/forge-std missing)
forge install foundry-rs/forge-std
```

---

## Compile

```powershell
# Hardhat
npm run compile
# or
npx hardhat compile

# Foundry
npm run forge:build
# or
forge build
```

---

## Test

```powershell
# Hardhat (legacy JS)
npm test

# Foundry unit + fuzz
npm run test:forge
npm run test:forge:fuzz

# Gas (Hardhat)
$env:REPORT_GAS="true"; npx hardhat test
```

---

## Configure Hardhat secrets

Hardhat uses configuration variables (not committed `.env` for keys):

```powershell
npx hardhat vars setup
npx hardhat vars set PRIVATE_KEY
npx hardhat vars set ALCHEMY_SEPOLIA_URI
# optional gas reporter
npx hardhat vars set CMC_API_KEY
npx hardhat vars list
```

| Variable | Purpose |
|----------|---------|
| `PRIVATE_KEY` | Deployer wallet (hex, with or without `0x`) |
| `ALCHEMY_SEPOLIA_URI` | **Full** Sepolia RPC URL **or** bare Alchemy API key |
| `CMC_API_KEY` | Optional CoinMarketCap for gas reporter |

**RPC examples (either form works):**

```powershell
# Preferred: full URL
npx hardhat vars set ALCHEMY_SEPOLIA_URI
# paste: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Also OK: key only (config builds the Alchemy URL for you)
# paste: YOUR_KEY
```

If you see `TypeError: Invalid URL` with `input: 'abc123...'`, the var was only the key and an older config treated it as a full URL — pull the latest `hardhat.config.ts` or set a full `https://...` URL.

Fund the deployer with Sepolia ETH (gas) on the target network.

---

## Deploy the new contracts

### Option A — Hardhat Ignition (recommended)

Modules wire **NFT ↔ Factory** and initialize accessory coordinate slots:

| Module | Contract | Use |
|--------|----------|-----|
| `ignition/modules/PenguinOnchain.ts` | `PenguinOnchain` + `PengoFactory` | Production params |
| `ignition/modules/PenguinOnchainTestnet.ts` | `PenguinOnchainTestnet` + `PengoFactory` | Cheaper mint / higher supply |

#### 1) Local / Hardhat network

```powershell
cd smartcontract
npx hardhat compile

# Terminal A
npx hardhat node

# Terminal B — deploy testnet-style module to localhost
npx hardhat ignition deploy ignition/modules/PenguinOnchainTestnet.ts --network localhost
```

#### 2) Sepolia (or configured network)

```powershell
cd smartcontract
npx hardhat compile

# Testnet collection
npx hardhat ignition deploy ignition/modules/PenguinOnchainTestnet.ts --network sepolia

# Production-parameter collection
npx hardhat ignition deploy ignition/modules/PenguinOnchain.ts --network sepolia
```

Ignition prints deployed addresses and stores journals under:

```text
ignition/deployments/chain-<chainId>/
  deployed_addresses.json
```

#### 3) After deploy — admin checklist

Connect as **owner** (deployer) and verify:

1. `PenguinOnchain.factory` → factory address  
2. `PengoFactory.pengoContract` → NFT address  
3. Allowed parts exist (`getAllAllowedParts`) after `initializeCoordinates` calls  
4. Optional: `setBeneficiaryAddress`, `setRoyaltyAddress`  
5. Smoke mint: `mintPengo{value: MINT_PRICE}(1)` then `tokenURI(tokenId)`  

```text
setFactory(factory)
setPengoContract(nft)          # already in Ignition module
initializeCoordinates(...)     # already in Ignition module (4 parts)
setBeneficiaryAddress(treasury)
setRoyaltyAddress(royaltyWallet)
```

---

### Option B — Manual deploy (console / script)

```powershell
npx hardhat console --network sepolia
```

```js
const Factory = await ethers.getContractFactory("PengoFactory");
const factory = await Factory.deploy();
await factory.waitForDeployment();

const NFT = await ethers.getContractFactory("PenguinOnchain"); // or PenguinOnchainTestnet
const nft = await NFT.deploy();
await nft.waitForDeployment();

await (await nft.setFactory(await factory.getAddress())).wait();
await (await factory.setPengoContract(await nft.getAddress())).wait();

// Then initializeCoordinates for each accessory slot (see ignition module for byte data)
```

---

### Option C — Foundry create (advanced)

```powershell
$env:Path = "$env:USERPROFILE\.foundry\bin;$env:Path"
forge create contracts/utils/PengoFactory.sol:PengoFactory --rpc-url $env:RPC --private-key $env:PK
forge create contracts/ERC721/PenguinOnchain.sol:PenguinOnchain --rpc-url $env:RPC --private-key $env:PK
# Then cast send setFactory / setPengoContract / initializeCoordinates
```

Prefer **Ignition** for the full wiring sequence.

---

## Wire the dapp after redeploy

Update `dapp/src/constants/PengoContract.json` (or your network entry):

```json
{
  "networkDeployment": [
    {
      "name": "Sepolia Testnet",
      "chainId": "11155111",
      "currency": "ETH",
      "explore": "https://sepolia.etherscan.io",
      "PengoAddress": "0xYOUR_NEW_NFT",
      "factoryAddress": "0xYOUR_NEW_FACTORY",
      "abi": [ /* paste from artifacts/contracts/ERC721/PenguinOnchain.sol/PenguinOnchain.json */ ]
    }
  ]
}
```

ABI sources:

```text
artifacts/contracts/ERC721/PenguinOnchain.sol/PenguinOnchain.json
artifacts/contracts/ERC721/PenguinOnchainTestnet.sol/PenguinOnchainTestnet.json
# or Foundry:
out/PenguinOnchain.sol/PenguinOnchain.json
```

Restart the dapp (`cd dapp && npm run dev`) and mint / studio / marketplace against the new addresses.

---

## Mainnet parameters (reference)

| Param | `PenguinOnchain` | `PenguinOnchainTestnet` |
|-------|------------------|-------------------------|
| `MAX_SUPPLY` | 20_000 | 50_000 |
| `MINT_PRICE` | 0.25 ETH | 0.05 ETH |
| `MAX_MINT_PER_WALLET` | 100 | 500 |
| `ROYALTY_PERCENT` | 5 | 5 |

---

## Project layout (contracts)

```text
smartcontract/
  contracts/
    ERC721/           # NFT
    utils/            # PengoFactory (SVG)
    libraries/        # pengoConverter, legacy base64
    interfaces/
    governance/
  forge-test/         # Foundry tests
  ignition/modules/   # Deploy modules
  test/               # Hardhat JS tests
  foundry.toml
  remappings.txt
  hardhat.config.ts
```

---

## License

MIT — Pengo Foundation / Onchain Pengo Lab
