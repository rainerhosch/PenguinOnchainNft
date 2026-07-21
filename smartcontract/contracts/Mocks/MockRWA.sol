// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockRWA is ERC20, Ownable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mint 1 million initial tokens to deployer for testing
        _mint(msg.sender, 1_000_000 * 1e18);
    }

    // Allows admin to mint more mock tokens to simulate RWA yields
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
