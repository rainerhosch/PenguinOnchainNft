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

## Deploy & Sync to DApp (Recommended)

We have created an automated Hardhat task `deploy-sync` which uses Hardhat Ignition to deploy the contracts, and then automatically syncs the new contract addresses and ABIs directly into your frontend (`dapp/src/constants/PengoContract.json` & `PengoAbi.json`).

| Network / Target | Command |
|------------------|---------|
| **Local Node** | `npx hardhat deploy-sync --module PenguinOnchain --network localhost` |
| **Sepolia Testnet** | `npx hardhat deploy-sync --module PenguinOnchainTestnet --network sepolia` |
| **Robinhood Mainnet** | `npx hardhat deploy-sync --module PenguinOnchain --network robinhood` |

### Modifiers & Hotfixes

If you only need to redeploy the `PenguinOnchain` NFT contract (e.g. to change the mint price) without redeploying the expensive `PengoFactory` and re-running the initialization transactions, you can use the Hotfix module:

```powershell
npx hardhat deploy-sync --module PenguinOnchainHotfix --network robinhood
```
*(Ensure your wallet is funded with sufficient ETH for gas before running).*

### After Deploy Checklist

Connect as **owner** (deployer) via block explorer or console and verify:
1. `PenguinOnchain.factory()` returns your factory address.
2. `PengoFactory.pengoContract()` returns your NFT address.
3. Call `setBeneficiaryAddress(treasuryWallet)`.
4. Call `setRoyaltyAddress(royaltyWallet)`.

---

## Manual Deployment Options

If you prefer to deploy manually without syncing to the DApp:

```powershell
# Deploy just via standard Ignition CLI
npx hardhat ignition deploy ignition/modules/PenguinOnchain.ts --network robinhood
```

If you deploy manually, you will need to manually copy the deployed addresses and ABI into the DApp frontend files:
- Addresses: `dapp/src/constants/PengoContract.json`
- ABI: `dapp/src/constants/PengoAbi.json`

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
