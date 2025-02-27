// SPDX-License-Identifier: MIT
/*
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%*---%%%%%%*---%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%#+++%%%%%%#+++%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%@@@@%#+++%@@@@%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%@@@@%#***%@@@@%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%#++++++*++*+++%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%*------=--=---%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%*==+================#%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%=--=------=--=------*%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@%%%%%%%---=--=------=--=------=--+%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@%%%%%%%---=--=------=--=------=--=%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@%%%%---=--=------=--=------=--=%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@%%%%---=--=------=--=------=--+%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%=--=------=--=------*%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%*==+================#%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%*------=--=---%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%#++++++*++*+++%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%#******%%%@%%%******%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*++*+++@@@@@@%++++++%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%@@@@@@@%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

* ** author  : Onchain Pengo Lab
* ** package : @contracts/utils/PengoFactory.sol
*/
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol"; 

interface IPenguinOnchain {
    function balanceOf(address owner) external view returns (uint256);
}

contract PengoDao is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }

    IPenguinOnchain public nftContract;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    mapping(address => uint256) public stakedEth;
    uint256 public totalStakedEth;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event ProposalCreated(uint256 proposalId, string description, uint256 startTime, uint256 endTime);
    event Voted(address indexed voter, uint256 proposalId, bool vote, uint256 power);
    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event ProposalEnded(uint256 proposalId);

    constructor(address _nftContract) {
        nftContract = IPenguinOnchain(_nftContract);
    }

    function createProposal(string memory _description, uint256 _duration) external onlyOwner {
        require(_duration > 0, "Duration must be greater than zero");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;

        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: _description,
            yesVotes: 0,
            noVotes: 0,
            startTime: startTime,
            endTime: endTime,
            active: true
        });

        emit ProposalCreated(proposalCount, _description, startTime, endTime);
    }

    function vote(uint256 _proposalId, bool _vote) external nonReentrant {
        require(proposals[_proposalId].active, "Proposal not active");
        require(block.timestamp >= proposals[_proposalId].startTime, "Voting has not started");
        require(block.timestamp <= proposals[_proposalId].endTime, "Voting has ended");
        require(!hasVoted[msg.sender][_proposalId], "Already voted");
        require(nftContract.balanceOf(msg.sender) > 0, "Must own an NFT to vote");

        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");

        hasVoted[msg.sender][_proposalId] = true;

        if (_vote) {
            proposals[_proposalId].yesVotes += votingPower;
        } else {
            proposals[_proposalId].noVotes += votingPower;
        }

        emit Voted(msg.sender, _proposalId, _vote, votingPower);
    }

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Must stake more than 0 ETH");
        
        stakedEth[msg.sender] += msg.value;
        totalStakedEth += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function unstake() external nonReentrant {
        uint256 amount = stakedEth[msg.sender];
        require(amount > 0, "No ETH staked");

        stakedEth[msg.sender] = 0;
        totalStakedEth -= amount;
        
        (bool successUnstake, ) = payable(msg.sender).call{value: amount}("");
        require(successUnstake, "Transfer failed.");

        emit Unstaked(msg.sender, amount);
    }

    function getVotingPower(address voter) public view returns (uint256) {
        uint256 nftPower = nftContract.balanceOf(voter);

        uint256 stakingPower = 0;
        if (totalStakedEth > 0) {
            stakingPower = stakedEth[voter].mul(100).div(totalStakedEth);
        }

        return nftPower * stakingPower;
    }

    function endProposal(uint256 _proposalId) external onlyOwner {
        require(proposals[_proposalId].active, "Proposal already ended");

        proposals[_proposalId].active = false;
        emit ProposalEnded(_proposalId);
    }

    function isVotingActive(uint256 _proposalId) public view returns (bool) {
        return 
            proposals[_proposalId].active &&
            block.timestamp >= proposals[_proposalId].startTime &&
            block.timestamp <= proposals[_proposalId].endTime;
    }

    
    function changePengoAddress(address _nftContract) external onlyOwner{
        nftContract = IPenguinOnchain(_nftContract);
    }
    
    function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);

        for (uint256 i = 1; i <= proposalCount; i++) {
            allProposals[i - 1] = proposals[i];
        }

        return allProposals;
    }
}
