// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../interfaces/IPenguinOnchain.sol";

import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

interface IPoolSwapTest {
    struct TestSettings {
        bool takeClaims;
        bool settleUsingBurn;
    }
    function swap(
        PoolKey memory key,
        SwapParams memory params,
        TestSettings memory testSettings,
        bytes memory hookData
    ) external payable returns (BalanceDelta delta);
}

interface IUniversalRouter {
    function execute(bytes calldata commands, bytes[] calldata inputs) external payable;
}

contract PengoStrategy is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, IERC721Receiver {
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
    mapping(address => mapping(uint256 => uint256)) private _deprecated_claimedDividends;
    
    // Staking Rewards Ext
    address[] public rewardTokens;
    mapping(address => bool) public isRewardToken;
    mapping(address => mapping(uint256 => uint256)) public rewardDebt; // rwaToken => tokenId => uint256
    mapping(address => mapping(uint256 => uint256)) public pendingDividends; // rwaToken => tokenId => uint256
    
    // Uniswap V4 Integration
    IPositionManager public positionManager;
    IPoolSwapTest public poolSwapTest; // DEPRECATED - DO NOT USE
    IUniversalRouter public universalRouter;
    
    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    struct ExactInputSingleParams {
        PoolKey poolKey;
        bool zeroForOne;
        uint128 amountIn;
        uint128 amountOutMinimum;
        bytes hookData;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _nftContract, address _positionManager) initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        nftContract = IPenguinOnchain(_nftContract);
        positionManager = IPositionManager(_positionManager);
    }

    function setNftContract(address _nftContract) external onlyOwner {
        nftContract = IPenguinOnchain(_nftContract);
    }

    function setPositionManager(address _positionManager) external onlyOwner {
        positionManager = IPositionManager(_positionManager);
    }
    
    // Deprecated
    function setPoolSwapTest(address _poolSwapTest) external onlyOwner {
        poolSwapTest = IPoolSwapTest(_poolSwapTest);
    }

    function setUniversalRouter(address _universalRouter) external onlyOwner {
        universalRouter = IUniversalRouter(_universalRouter);
    }
    
    receive() external payable {}
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // --- Governance ---
    function propose(address rwaToken, bool isAdd, uint256 tokenId) external {
        require(IERC721(address(nftContract)).ownerOf(tokenId) == msg.sender, "Not token owner");
        uint256 power = nftContract.sharePower(tokenId);
        require(power > 0, "No share power");

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
        uint256 totalPower = nftContract.totalSharePower();
        uint256 absoluteMajority = (totalPower / 2) + 1;

        require(block.timestamp >= p.endTime || p.yesVotes >= absoluteMajority, "Voting not ended and no absolute majority");
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
        
        _internalDistributeYield(rwaToken, amount, totalPower);
    }
    
    function _internalDistributeYield(address rwaToken, uint256 amount, uint256 totalPower) internal {
        totalDividendsPerPower[rwaToken] += (amount * 1e18) / totalPower;
        
        if (!isRewardToken[rwaToken]) {
            isRewardToken[rwaToken] = true;
            rewardTokens.push(rwaToken);
        }
    }
    
    function getClaimableDividends(address rwaToken, uint256 tokenId) public view returns (uint256) {
        uint256 power = nftContract.sharePower(tokenId);
        uint256 _total = totalDividendsPerPower[rwaToken];
        uint256 owed = (power * _total) / 1e18;
        
        uint256 _debt = rewardDebt[rwaToken][tokenId];
        uint256 _pending = pendingDividends[rwaToken][tokenId];
        
        if (owed > _debt) {
            _pending += (owed - _debt);
        }
        return _pending;
    }

    function updateRewardDebt(uint256 tokenId) external {
        require(msg.sender == address(nftContract), "Only NFT contract can update debt");
        uint256 power = nftContract.sharePower(tokenId);
        
        for (uint i = 0; i < rewardTokens.length; i++) {
            address rwa = rewardTokens[i];
            uint256 _total = totalDividendsPerPower[rwa];
            uint256 owed = (power * _total) / 1e18;
            uint256 _debt = rewardDebt[rwa][tokenId];
            
            if (owed > _debt) {
                pendingDividends[rwa][tokenId] += (owed - _debt);
            }
            rewardDebt[rwa][tokenId] = (power * _total) / 1e18;
        }
    }

    function syncRewardDebt(uint256 tokenId) external {
        require(msg.sender == address(nftContract), "Only NFT contract can update debt");
        uint256 power = nftContract.sharePower(tokenId);
        
        for (uint i = 0; i < rewardTokens.length; i++) {
            address rwa = rewardTokens[i];
            uint256 _total = totalDividendsPerPower[rwa];
            rewardDebt[rwa][tokenId] = (power * _total) / 1e18;
        }
    }

    function claimAllDividendsFor(uint256 tokenId, address receiver) external nonReentrant {
        require(msg.sender == address(nftContract), "Only NFT contract can auto-sweep");
        uint256 power = nftContract.sharePower(tokenId);
        
        for (uint i = 0; i < rewardTokens.length; i++) {
            address rwa = rewardTokens[i];
            uint256 claimable = getClaimableDividends(rwa, tokenId);
            
            if (claimable > 0) {
                pendingDividends[rwa][tokenId] = 0;
                rewardDebt[rwa][tokenId] = (power * totalDividendsPerPower[rwa]) / 1e18;
                IERC20(rwa).transfer(receiver, claimable);
            }
        }
    }

    function claimDividends(address rwaToken, uint256 tokenId) external nonReentrant {
        require(IERC721(address(nftContract)).ownerOf(tokenId) == msg.sender, "Not token owner");
        
        uint256 payout = getClaimableDividends(rwaToken, tokenId);
        require(payout > 0, "No dividends owed");
        
        uint256 power = nftContract.sharePower(tokenId);
        pendingDividends[rwaToken][tokenId] = 0;
        rewardDebt[rwaToken][tokenId] = (power * totalDividendsPerPower[rwaToken]) / 1e18;
        
        IERC20(rwaToken).transfer(msg.sender, payout);
    }
    
    function hotfixAddRewardToken(address rwa) external onlyOwner {
        if (!isRewardToken[rwa]) {
            isRewardToken[rwa] = true;
            rewardTokens.push(rwa);
        }
    }

    function hotfixAddToBuyList(address rwa) external onlyOwner {
        if (!inBuyList[rwa]) {
            inBuyList[rwa] = true;
            activeBuyList.push(rwa);
        }
    }

    function getRewardTokens() external view returns (address[] memory) {
        return rewardTokens;
    }

    function getActiveBuyList() external view returns (address[] memory) {
        return activeBuyList;
    }

    // --- Uniswap V4 Integration ---
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function claimFeesFromPosition(uint256 lpTokenId, Currency currency0, Currency currency1) external nonReentrant onlyOwner {
        _claimFees(lpTokenId, currency0, currency1);
    }

    function _claimFees(uint256 lpTokenId, Currency currency0, Currency currency1) internal {
        bytes memory actions = new bytes(2);
        actions[0] = bytes1(uint8(Actions.DECREASE_LIQUIDITY));
        actions[1] = bytes1(uint8(Actions.TAKE_PAIR));

        bytes[] memory params = new bytes[](2);
        params[0] = abi.encode(lpTokenId, 0, 0, 0, ""); // (tokenId, liquidity, amount0Min, amount1Min, hookData)
        params[1] = abi.encode(currency0, currency1, address(this)); // (currency0, currency1, recipient)

        positionManager.modifyLiquidities(
            abi.encode(actions, params),
            block.timestamp + 300
        );
    }

    function claimAndSwapForRWA(
        uint256 lpTokenId, 
        Currency currency0, 
        Currency currency1,
        PoolKey[] calldata rwaPoolKeys,
        uint128[] calldata amountOutMinimums
    ) external nonReentrant onlyOwner {
        require(rwaPoolKeys.length == activeBuyList.length, "Pool keys count must match active buy list");
        require(rwaPoolKeys.length == amountOutMinimums.length, "Min amounts count must match active buy list");
        require(activeBuyList.length > 0, "No active RWA in buy list");
        require(address(universalRouter) != address(0), "UniversalRouter not set");
        
        uint256 totalPower = nftContract.totalSharePower();
        require(totalPower > 0, "No share power exists");

        uint256 ethBefore = address(this).balance;
        address token1 = Currency.unwrap(currency1);
        uint256 pengoBefore = 0;
        
        if (token1 != address(0)) {
            pengoBefore = IERC20(token1).balanceOf(address(this));
        }

        _claimFees(lpTokenId, currency0, currency1);

        uint256 ethGained = address(this).balance - ethBefore;
        uint256 pengoGained = 0;

        // Deflationary Fee Burn Mechanism:
        // Any PENGO collected as fee is sent directly to the dead address
        if (token1 != address(0)) {
            pengoGained = IERC20(token1).balanceOf(address(this)) - pengoBefore;
            if (pengoGained > 0) {
                IERC20(token1).transfer(DEAD_ADDRESS, pengoGained);
            }
        }

        uint256 ethPerRwa = ethGained / activeBuyList.length;

        for (uint i = 0; i < activeBuyList.length; i++) {
            address rwaToken = activeBuyList[i];
            PoolKey calldata rwaPoolKey = rwaPoolKeys[i];
            
            // Verify PoolKey corresponds to rwaToken
            require(
                Currency.unwrap(rwaPoolKey.currency0) == rwaToken || Currency.unwrap(rwaPoolKey.currency1) == rwaToken,
                "PoolKey does not match RWA"
            );

            uint256 rwaBefore = IERC20(rwaToken).balanceOf(address(this));

            if (ethPerRwa > 0) {
                // UniversalRouter V4_SWAP encoding:
                // commands = 0x10 (V4_SWAP)
                // inputs[0] = abi.encode(bytes actions, bytes[] params)
                // actions = SWAP_EXACT_IN_SINGLE(0x06) + SETTLE_ALL(0x0c) + TAKE_ALL(0x0f)
                bytes memory commands = hex"10";
                bytes[] memory inputs = new bytes[](1);

                bytes memory actions = abi.encodePacked(uint8(0x06), uint8(0x0c), uint8(0x0f));
                bytes[] memory params = new bytes[](3);

                bool zeroForOne = Currency.unwrap(rwaPoolKey.currency0) == address(0);
                
                // param0: SWAP_EXACT_IN_SINGLE params
                params[0] = abi.encode(ExactInputSingleParams({
                    poolKey: rwaPoolKey,
                    zeroForOne: zeroForOne,
                    amountIn: uint128(ethPerRwa),
                    amountOutMinimum: amountOutMinimums[i],
                    hookData: ""
                }));

                // param1: SETTLE_ALL (currency, maxAmount)
                address currencyIn = zeroForOne ? address(0) : rwaToken;
                params[1] = abi.encode(currencyIn, ethPerRwa);

                // param2: TAKE_ALL (currency, minAmount)
                address currencyOut = zeroForOne ? rwaToken : address(0);
                params[2] = abi.encode(currencyOut, amountOutMinimums[i]);

                inputs[0] = abi.encode(actions, params);

                // Execute the swap on Universal Router, sending the ETH chunk
                universalRouter.execute{value: ethPerRwa}(commands, inputs);
            }

            uint256 rwaGained = IERC20(rwaToken).balanceOf(address(this)) - rwaBefore;
            if (rwaGained > 0) {
                _internalDistributeYield(rwaToken, rwaGained, totalPower);
            }
        }
    }
}
