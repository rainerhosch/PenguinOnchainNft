// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/Strategy/PengoStrategy.sol";
import "../contracts/ERC20/PengoToken.sol";
import "../contracts/Mocks/MockRWA.sol";
import "../contracts/ERC721/PenguinOnchainTestnet.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract PengoVaultTest is Test {
    PenguinOnchainTestnet public nft;
    PengoToken public pengoToken;
    MockRWA public mockRwa;
    PengoStrategy public strategy;
    
    address public owner = address(this);
    address public user1 = address(0x1111);
    address public user2 = address(0x2222);

    function setUp() public {
        // 1. Deploy NFT (Mocking Factory for simplicity or using Testnet version)
        nft = new PenguinOnchainTestnet();
        
        // 2. Deploy Tokens
        pengoToken = new PengoToken(1000000 * 1e18);
        mockRwa = new MockRWA("Mock Apple", "mAAPL");
        
        // 3. Deploy Strategy Proxy
        PengoStrategy impl = new PengoStrategy();
        bytes memory initData = abi.encodeWithSelector(PengoStrategy.initialize.selector, address(nft));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        strategy = PengoStrategy(address(proxy));
        
        // Setup initial states
        nft.setPengoToken(address(pengoToken)); // so pengoToken can add power
        
        // Give user1 some pengo tokens to burn
        pengoToken.transfer(user1, 1000 * 1e18);
    }

    // Helper to simulate minting an NFT for user1
    function _mintNftToUser1() internal returns (uint256) {
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        uint256[] memory ids = nft.mintPengo{value: 0.05 ether}(1);
        return ids[0];
    }

    function test_ProposeAndVote() public {
        uint256 tokenId = _mintNftToUser1();
        
        // User1 burns tokens to get share power
        vm.startPrank(user1);
        pengoToken.burnForPower(tokenId, 100 * 1e18);
        vm.stopPrank();
        
        assertEq(nft.sharePower(tokenId), 100 * 1e18);
        
        // Propose
        strategy.propose(address(mockRwa), true);
        
        // Vote
        vm.prank(user1);
        strategy.vote(1, tokenId, true);
        
        (, , uint256 yesVotes, , , ) = strategy.proposals(1);
        assertEq(yesVotes, 100 * 1e18);
    }

    function test_ExecuteProposal() public {
        test_ProposeAndVote();
        
        // Fast forward 4 days to bypass the 3 day voting period
        skip(4 days);
        
        strategy.executeProposal(1);
        
        assertTrue(strategy.inBuyList(address(mockRwa)));
    }

    function test_DistributeAndClaimYield() public {
        test_ExecuteProposal(); // sets up an approved RWA and user1 with 100 power
        
        // Admin distributes yield
        mockRwa.mint(owner, 1000 * 1e18);
        mockRwa.approve(address(strategy), 1000 * 1e18);
        strategy.distributeYield(address(mockRwa), 1000 * 1e18);
        
        // User claims
        vm.prank(user1);
        strategy.claimDividends(address(mockRwa), 1); // assuming tokenId is 1
        
        // User1 should have 1000 * 1e18 since they hold 100% of the share power
        assertEq(mockRwa.balanceOf(user1), 1000 * 1e18);
    }
}
