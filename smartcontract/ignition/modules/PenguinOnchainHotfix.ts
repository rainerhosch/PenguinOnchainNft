import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PenguinOnchainHotfix", (m) => {
    // Load the existing factory that was already deployed
    const pengoFactory = m.contractAt("PengoFactory", "0x3993bAddb467Bd155a83A63567e1B2B34E1926C6");
    
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
