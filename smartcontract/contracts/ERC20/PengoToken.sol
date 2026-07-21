// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPenguinOnchain.sol";

contract PengoToken is ERC20, Ownable {
    IPenguinOnchain public nftContract;

    constructor(uint256 initialSupply) ERC20("Penguin Onchain Token", "PENGO") {
        _mint(msg.sender, initialSupply);
    }

    function setNftContract(address _nftContract) external onlyOwner {
        nftContract = IPenguinOnchain(_nftContract);
    }

    function burnForPower(uint256 tokenId, uint256 amount) external {
        require(address(nftContract) != address(0), "NFT contract not set");
        _burn(msg.sender, amount);
        nftContract.addSharePower(tokenId, amount);
    }
}
