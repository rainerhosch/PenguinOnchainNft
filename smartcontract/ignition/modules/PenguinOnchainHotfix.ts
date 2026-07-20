import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PenguinOnchainHotfix", (m) => {
    // Load the existing factory that was already deployed
    const pengoFactory = m.contractAt("PengoFactory", "0xF44DE6051efC6539FD66c93Ee5439737398bCd57");

    // Deploy the updated PenguinOnchain contract with the new mint price
    const penguinOnchain = m.contract("PenguinOnchain");

    // Link the two contracts together
    m.call(penguinOnchain, "setFactory", [pengoFactory]);
    m.call(pengoFactory, "setPengoContract", [penguinOnchain]);

    return {
        pengoFactory,
        penguinOnchain
    };
});
