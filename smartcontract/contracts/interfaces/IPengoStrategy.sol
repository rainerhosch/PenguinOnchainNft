// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPengoStrategy {
    function getClaimableDividends(address rwaToken, uint256 tokenId) external view returns (uint256);
    function updateRewardDebt(uint256 tokenId) external;
    function syncRewardDebt(uint256 tokenId) external;
    function claimAllDividendsFor(uint256 tokenId, address receiver) external;
    function rewardTokens(uint256 index) external view returns (address);
}
