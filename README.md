# Penguin Onchain

Fully **on-chain** NFT monorepo: customizable pixel penguins, accessory marketplace, and a Next.js dapp.

**Tagline:** *Fully on-chain · Fully yours — Draw it. Own it. Live it forever.*

| Package | Path | Stack |
|---------|------|--------|
| **Dapp** | [`dapp/`](./dapp) | Next.js 15, React 19, wagmi 2, viem, RainbowKit, Tailwind |
| **Contracts** | [`smartcontract/`](./smartcontract) | Solidity 0.8.x, Hardhat, Foundry, ERC721A, Solady, OpenZeppelin |

---

## What’s new (upgrade)

### Smart contracts

- Security fixes: mint escrow safety, supply/wallet limits, offer/purchase ownership, factory access control  
- Gas: custom errors, cheaper mint traits path, Solady **Base64 / LibString / DynamicBuffer** for factory SVG  
- **Foundry** unit + **fuzz** tests (`testFuzz_*` for mint / `tokenURI`)  
- Deploy via Hardhat Ignition (see [smartcontract/README.md](./smartcontract/README.md))

### Dapp

- Modern mint / studio / marketplace UX (lime `#acff00` + black)  
- Dynamic studio live preview from selected Pengo `tokenURI`  
- Single-toast tx flow (wallet → pending hash → success + reload)  

> Redeploy contracts after the Solidity upgrade, then point the dapp ABI/addresses at the new deployment.

---

## Quick start — Dapp

```powershell
cd dapp
npm install
# optional: .env.local
# NEXT_PUBLIC_PROJECT_ID=...
# NEXT_PUBLIC_SEPOLIA_RPC_URL=...
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Quick start — Smart contracts

```powershell
cd smartcontract
npm install
npx hardhat compile

# Foundry (add forge to PATH if needed)
$env:Path = "$env:USERPROFILE\.foundry\bin;$env:Path"
forge test -vv
```

### Deploy new contracts (Sepolia example)

```powershell
cd smartcontract
npx hardhat vars set PRIVATE_KEY
npx hardhat vars set ALCHEMY_SEPOLIA_URI

# Testnet collection (lower price / higher supply)
npx hardhat ignition deploy ignition/modules/PenguinOnchainTestnet.ts --network sepolia

# Production-parameter collection
npx hardhat ignition deploy ignition/modules/PenguinOnchain.ts --network sepolia
```

Addresses are written under:

```text
smartcontract/ignition/deployments/chain-<chainId>/deployed_addresses.json
```

Then update `dapp/src/constants/PengoContract.json` with the new NFT + factory addresses and ABI.

**Full deploy checklist, post-deploy admin steps, and ABI wiring:**  
→ **[smartcontract/README.md](./smartcontract/README.md)**

---

## Repo structure

```text
penguinonchain/
  dapp/                 # Frontend
  smartcontract/        # Solidity + Hardhat + Foundry
  assets/               # Brand assets
  README.md             # This file
```

---

## Networks

Configure chains and contract addresses in `dapp/src/constants/PengoContract.json`.  
Default wallet stack supports Sepolia (and Base entries can be added when deployed).

---

## Links

- Site: [https://penguinonchain.top](https://penguinonchain.top)  
- X: [@onchainpengo](https://x.com/onchainpengo)  
- Discord: [discord.gg/penguinonchain](https://discord.gg/penguinonchain)

---

## License

MIT
