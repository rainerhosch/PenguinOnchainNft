// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PengoStrategy.sol";

contract PengoStrategyTest is PengoStrategy {
    function forceAddRWA(address rwaToken) external onlyOwner {
        if (!inBuyList[rwaToken]) {
            inBuyList[rwaToken] = true;
            activeBuyList.push(rwaToken);
        }
    }
}
