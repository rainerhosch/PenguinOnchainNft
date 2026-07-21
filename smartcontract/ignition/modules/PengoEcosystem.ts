import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PengoEcosystem", (m) => {
    // 1. Get references or deploy NFT (Assuming we already have it, we mock its address)
    const nftAddress = m.getParameter("nftAddress", "0x0000000000000000000000000000000000000000"); // Mock or real

    // 2. Deploy Mock RWA tokens for Sepolia
    const mockAAPL = m.contract("MockRWA", ["Mock Apple", "mAAPL"], { id: "MockAAPL" });
    const mockNVIDIA = m.contract("MockRWA", ["Mock NVIDIA", "mNVDA"], { id: "MockNVIDIA" });
    const mockGold = m.contract("MockRWA", ["Mock Gold", "mGOLD"], { id: "MockGold" });
    const mockGoogle = m.contract("MockRWA", ["Mock Google", "mGOOGL"], { id: "MockGoogle" });


    // 3. Deploy PENGO Token (Total Supply: 1 Billion)
    const pengoToken = m.contract("PengoToken", [1_000_000_000n * 10n ** 18n]);

    // 4. Deploy UUPS Vault (PengoStrategy)
    const pengoStrategyImpl = m.contract("PengoStrategy");
    const initData = m.encodeFunctionCall(pengoStrategyImpl, "initialize", [nftAddress]);
    const pengoStrategyProxy = m.contract("ERC1967Proxy", [pengoStrategyImpl, initData], { id: "PengoStrategyProxy" });

    // 5. Deploy Bonding Curve
    // Assuming Uniswap Router exists on testnet/mainnet (0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D for Uniswap V2 Mainnet/Sepolia)
    const uniswapRouter = m.getParameter("uniswapRouter", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
    const bondingCurve = m.contract("PengoBondingCurve", [
        pengoToken,
        uniswapRouter,
        pengoStrategyProxy
    ]);

    // 6. Setup Initial Configs (Transfer PENGO to Bonding Curve, etc.)
    // Note: Bonding curve takes 800M for sale + 200M for LP = 1 Billion
    // We send the entire supply to the bonding curve.
    m.call(pengoToken, "transfer", [bondingCurve, 1_000_000_000n * 10n ** 18n]);

    return { mockAAPL, mockNVIDIA, pengoToken, pengoStrategyProxy, bondingCurve };
});
