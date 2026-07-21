# $PENGO Token, DEX Liquidity, & RWA DAO Masterplan

Ini adalah rancangan arsitektur final, mengintegrasikan sistem **Bonding Curve (Pump.fun style)** untuk likuiditas awal, mitigasi keamanan *Vault*, dan pola hibrida untuk **Upgradeable Contracts**.

## Ringkasan Eksekutif

Sistem baru ini membentuk ekosistem ekonomi tertutup (circular economy) untuk PenguinOnchain:
1. **Bonding Curve Launch**: Token `$PENGO` dijual melalui *Bonding Curve* (kurva harga matematis) tanpa perlu menyediakan LP di awal.
2. **DEX Migration**: Setelah target likuiditas Bonding Curve tercapai, likuiditas otomatis di-migrasikan ke DEX (Uniswap).
3. **Share Power System (NFT)**: Trait khusus yang didapat dengan mem-burn `$PENGO`. Kekuatan ini akan **ter-reset (hilang)** jika NFT ditransfer.
4. **PengoStrategy (Vault & Governance DAO)**: Memanen fee dari LP Uniswap, membeli token RWA berdasarkan voting komunitas, dan menampung dividen RWA agar bisa diklaim oleh *holder* secara aman.

---

## Upgradeable vs Immutable Contracts

**Arsitektur Hibrida**:
1. **`PengoToken.sol` (ERC20)** -> **IMMUTABLE (Tidak bisa di-upgrade)**
   - *Alasan:* Token harus 100% *trustless*. Komunitas/investor benci token yang logikanya bisa diubah admin sesuka hati.
2. **`PengoBondingCurve.sol`** -> **IMMUTABLE**
   - *Alasan:* Kontrak *launchpad* sementara. Setelah target tercapai dan LP pindah ke Uniswap, kontrak ini tidak dipakai lagi.
3. **`PenguinOnchain.sol` (NFT)** -> **IMMUTABLE**
   - *Alasan:* Melanjutkan pola Hotfix deployment.
4. **`PengoStrategy.sol` (DAO & Vault)** -> **UPGRADEABLE (UUPS Proxy)**
   - *Alasan:* Fleksibilitas DeFi. Jika di masa depan perlu pindah dari Uniswap V2 ke V4, logika Vault bisa diupgrade tanpa memindahkan dana LP dan dividen yang mengendap.

---

## Proposed Architecture (Smart Contracts)

### 1. `PengoBondingCurve.sol` (Immutable)
- User membeli `$PENGO` menggunakan ETH dengan sistem harga matematis.
- **`migrateLiquidity()`**: Jika modal terkumpul, otomatis membuat LP di Uniswap, mendepositkan dana, lalu mengirim token LP (Liquidity Provider) ke Vault.

### 2. `PenguinOnchain.sol` (Immutable - Hotfix Update)
- **`sharePower` & `totalSharePower`**: Variabel penyimpanan *power*.
- **`addSharePower(uint256 tokenId, uint256 amount)`**: Hanya bisa dipanggil oleh kontrak `$PENGO`.
- **Hook Transfer**: Mereset *Share Power* ke 0 jika NFT dipindahtangankan.

### 3. `PengoToken.sol` (Immutable ERC20)
- Fungsi `burnForPower(uint256 tokenId, uint256 amount)`. Hak *minting* awal dipegang oleh Bonding Curve.

### 4. `PengoStrategy.sol` (Upgradeable UUPS Vault)
- **LP Manager**: Memegang Token LP dari hasil migrasi Bonding Curve dan secara periodik melakukan `claimFees()` dari DEX.
- **DAO Governance**: Voting (bobot = *Share Power*) untuk memasukkan atau menghapus Token RWA dari "Active Buy List".
- **Automated Buyer**: Fee ETH dari Uniswap di-swap otomatis menjadi Token RWA (MockNVIDIA/MockAAPL di Sepolia).
- **Dividend Distributor (Pull Pattern)**: Pemilik NFT dengan *Share Power* memanggil fungsi `claimDividends(uint256 tokenId)` untuk menarik bagian dividen.

---

## Security Mitigations
- **Push vs Pull**: Menggunakan mekanisme **Pull** (seperti EIP-2222) untuk pembagian dividen. Mengirim secara langsung (Airdrop) ke 20.000 address adalah *anti-pattern* dan boros gas. Vault hanya menyimpan dana, user sendiri yang menanggung gas fee saat melakukan *claim*.
- **Mock RWA (Sepolia)**: Simulasi RWA sungguhan di Robinhood menggunakan tiruan token ERC20 di jaringan testnet Sepolia.
