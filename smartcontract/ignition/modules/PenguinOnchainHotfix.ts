import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PenguinOnchainHotfix", (m) => {
    // Factory address is parameterized — passed via ignition/parameters/<network>.json
    // This prevents hardcoding per-network addresses and avoids address swap mistakes
    const factoryAddr = m.getParameter("factoryAddress");
    const pengoFactory = m.contractAt("PengoFactory", factoryAddr);

    // Deploy the updated PenguinOnchain contract
    const penguinOnchain = m.contract("PenguinOnchain");

    // Re-link the two contracts together
    m.call(penguinOnchain, "setFactory", [pengoFactory]);
    m.call(pengoFactory, "setPengoContract", [penguinOnchain]);

    return {
        pengoFactory,
        penguinOnchain
    };
});
