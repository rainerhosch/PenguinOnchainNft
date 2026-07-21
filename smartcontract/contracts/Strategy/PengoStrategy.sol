// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IPenguinOnchain.sol";

contract PengoStrategy is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IPenguinOnchain public nftContract;
    
    struct Proposal {
        address rwaToken;
        bool isAdd;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool executed;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    mapping(uint256 => mapping(uint256 => bool)) public hasVoted; // proposalId => tokenId => bool
    
    address[] public activeBuyList;
    mapping(address => bool) public inBuyList;
    
    // Dividend tracker
    mapping(address => uint256) public totalDividendsPerPower; 
    mapping(address => mapping(uint256 => uint256)) public claimedDividendsPerPower; // rwaToken => tokenId => uint256
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _nftContract) initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        nftContract = IPenguinOnchain(_nftContract);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // --- Governance ---
    function propose(address rwaToken, bool isAdd) external {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            rwaToken: rwaToken,
            isAdd: isAdd,
            yesVotes: 0,
            noVotes: 0,
            endTime: block.timestamp + 3 days,
            executed: false
        });
    }
    
    function vote(uint256 proposalId, uint256 tokenId, bool support) external {
        require(IERC721(address(nftContract)).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!hasVoted[proposalId][tokenId], "Already voted");
        require(block.timestamp < proposals[proposalId].endTime, "Voting ended");
        
        uint256 power = nftContract.sharePower(tokenId);
        require(power > 0, "No share power");
        
        hasVoted[proposalId][tokenId] = true;
        
        if (support) {
            proposals[proposalId].yesVotes += power;
        } else {
            proposals[proposalId].noVotes += power;
        }
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.endTime, "Voting not ended");
        require(!p.executed, "Already executed");
        
        p.executed = true;
        
        if (p.yesVotes > p.noVotes) {
            if (p.isAdd && !inBuyList[p.rwaToken]) {
                inBuyList[p.rwaToken] = true;
                activeBuyList.push(p.rwaToken);
            } else if (!p.isAdd && inBuyList[p.rwaToken]) {
                inBuyList[p.rwaToken] = false;
                for(uint i=0; i<activeBuyList.length; i++) {
                    if(activeBuyList[i] == p.rwaToken) {
                        activeBuyList[i] = activeBuyList[activeBuyList.length - 1];
                        activeBuyList.pop();
                        break;
                    }
                }
            }
        }
    }
    
    // --- Dividend ---
    function distributeYield(address rwaToken, uint256 amount) external {
        require(inBuyList[rwaToken], "Not an approved RWA");
        uint256 totalPower = nftContract.totalSharePower();
        require(totalPower > 0, "No share power exists");
        
        IERC20(rwaToken).transferFrom(msg.sender, address(this), amount);
        totalDividendsPerPower[rwaToken] += (amount * 1e18) / totalPower;
    }
    
    function claimDividends(address rwaToken, uint256 tokenId) external nonReentrant {
        require(IERC721(address(nftContract)).ownerOf(tokenId) == msg.sender, "Not token owner");
        
        uint256 power = nftContract.sharePower(tokenId);
        require(power > 0, "No share power");
        
        uint256 owedPerPower = totalDividendsPerPower[rwaToken] - claimedDividendsPerPower[rwaToken][tokenId];
        require(owedPerPower > 0, "No dividends owed");
        
        uint256 payout = (power * owedPerPower) / 1e18;
        claimedDividendsPerPower[rwaToken][tokenId] = totalDividendsPerPower[rwaToken];
        
        IERC20(rwaToken).transfer(msg.sender, payout);
    }
}
