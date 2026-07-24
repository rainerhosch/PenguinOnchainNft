// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {FullMath} from "@uniswap/v4-core/src/libraries/FullMath.sol";

import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {LiquidityAmounts} from "@uniswap/v4-periphery/src/libraries/LiquidityAmounts.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

import {FixedPointMathLib} from "solady/src/utils/FixedPointMathLib.sol";

contract PengoBondingCurve is Ownable {
    IERC20 public pengoToken;
    IPoolManager public poolManager;
    IPositionManager public positionManager;
    IAllowanceTransfer public permit2;
    
    uint256 public immutable TARGET_LIQUIDITY; 
    uint256 public constant TOKENS_FOR_SALE = 800_000_000 * 1e18;
    uint256 public constant TOKENS_FOR_LIQUIDITY = 200_000_000 * 1e18;
    
    uint256 public immutable basePrice;
    uint256 public immutable priceIncrement;
    
    uint256 public tokensSold;
    bool public isMigrated;
    
    address public strategyVault;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, uint256 taxEth);
    event TokensSold(address indexed seller, uint256 amount, uint256 returnEth, uint256 taxEth);
    event LiquidityMigrated(uint256 ethAmount, uint256 tokenAmount, uint256 lpTokens);

    constructor(
        address _pengoToken, 
        address _poolManager, 
        address _positionManager,
        address _permit2,
        address _strategyVault, 
        uint256 _targetLiquidity
    ) {
        pengoToken = IERC20(_pengoToken);
        poolManager = IPoolManager(_poolManager);
        positionManager = IPositionManager(_positionManager);
        permit2 = IAllowanceTransfer(_permit2);
        strategyVault = _strategyVault;
        TARGET_LIQUIDITY = _targetLiquidity;

        // Automatically configure the bonding curve slope based on TARGET_LIQUIDITY
        // We want 800M tokens to cost exactly TARGET_LIQUIDITY
        uint256 n = TOKENS_FOR_SALE / 1e18; // 800,000,000
        uint256 avgPrice = _targetLiquidity / n;
        basePrice = avgPrice / 25; // Base price is 1/25th of the average price
        
        // Solve for priceIncrement: n * (n - 1) * priceIncrement = 2 * TARGET - 2 * n * basePrice
        uint256 targetx2 = _targetLiquidity * 2;
        uint256 basex2xn = basePrice * 2 * n;
        require(targetx2 > basex2xn, "Invalid target liquidity for curve");
        
        priceIncrement = (targetx2 - basex2xn) / (n * (n - 1));
    }

    function getCost(uint256 amount) public view returns (uint256 totalCost, uint256 taxEth) {
        require(amount % 1e18 == 0, "Amount must be in full tokens");
        uint256 fullTokensToBuy = amount / 1e18;
        uint256 currentSold = tokensSold / 1e18;
        
        uint256 a = basePrice + (currentSold * priceIncrement);
        uint256 n = fullTokensToBuy;
        uint256 baseCost = (n * (2 * a + (n - 1) * priceIncrement)) / 2;
        
        taxEth = baseCost / 100; // 1% tax
        totalCost = baseCost + taxEth;
    }

    function getSellValue(uint256 amount) public view returns (uint256 returnEth, uint256 taxEth) {
        require(amount % 1e18 == 0, "Amount must be in full tokens");
        require(amount <= tokensSold, "Amount exceeds tokens sold");
        
        uint256 fullTokensToSell = amount / 1e18;
        uint256 currentSold = (tokensSold - amount) / 1e18; // we calculate area from (tokensSold - amount) to tokensSold
        
        uint256 a = basePrice + (currentSold * priceIncrement);
        uint256 n = fullTokensToSell;
        uint256 totalEthValue = (n * (2 * a + (n - 1) * priceIncrement)) / 2;
        
        taxEth = totalEthValue / 100; // 1% tax
        returnEth = totalEthValue - taxEth;
    }

    function buy(uint256 amount) external payable {
        require(!isMigrated, "Liquidity already migrated to DEX");
        require(tokensSold + amount <= TOKENS_FOR_SALE, "Exceeds available tokens for sale");
        
        (uint256 totalCost, uint256 taxEth) = getCost(amount);
        require(msg.value >= totalCost, "Insufficient ETH sent");
        
        tokensSold += amount;
        require(pengoToken.transfer(msg.sender, amount), "Token transfer failed");
        
        emit TokensPurchased(msg.sender, amount, totalCost, taxEth);
        
        // Refund excess ETH
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        // Check if target liquidity is reached
        if (address(this).balance >= TARGET_LIQUIDITY) {
            _migrateLiquidity();
        }
    }

    function sell(uint256 amount) external {
        require(!isMigrated, "Liquidity already migrated to DEX");
        require(amount > 0, "Amount must be greater than zero");
        
        (uint256 returnEth, uint256 taxEth) = getSellValue(amount);
        
        // Ensure contract has enough ETH to pay the user
        require(address(this).balance >= returnEth, "Contract has insufficient ETH");
        
        tokensSold -= amount;
        
        // Transfer tokens from user to contract (requires user to approve first)
        require(pengoToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // Send ETH back to user (net of tax)
        payable(msg.sender).transfer(returnEth);
        
        emit TokensSold(msg.sender, amount, returnEth, taxEth);
        
        // Note: the taxEth is naturally kept in address(this).balance.
        // We check if target liquidity is reached from tax!
        if (address(this).balance >= TARGET_LIQUIDITY) {
            _migrateLiquidity();
        }
    }

    function _migrateLiquidity() internal {
        isMigrated = true;
        
        uint256 ethBalance = address(this).balance;
        uint256 tokenBalance = pengoToken.balanceOf(address(this));
        
        require(tokenBalance >= TOKENS_FOR_LIQUIDITY, "Not enough tokens for LP");
        
        // Setup PoolKey
        Currency currency0 = CurrencyLibrary.ADDRESS_ZERO;
        Currency currency1 = Currency.wrap(address(pengoToken));
        
        uint24 fee = 3000; // 0.3%
        int24 tickSpacing = 60;
        
        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0))
        });
        
        // Calculate sqrtPriceX96
        // token0 is ETH, token1 is PENGO
        // Price = token1 / token0 = TOKENS_FOR_LIQUIDITY / ethBalance
        uint256 ratioX192 = FullMath.mulDiv(TOKENS_FOR_LIQUIDITY, 1 << 192, ethBalance);
        uint160 sqrtPriceX96 = uint160(FixedPointMathLib.sqrt(ratioX192));
        
        // Initialize pool
        poolManager.initialize(poolKey, sqrtPriceX96);
        
        // Full range ticks
        int24 tickLower = (TickMath.MIN_TICK / tickSpacing) * tickSpacing;
        int24 tickUpper = (TickMath.MAX_TICK / tickSpacing) * tickSpacing;
        
        // Calculate required liquidity amount
        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtPriceX96,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            ethBalance,
            TOKENS_FOR_LIQUIDITY
        );
        
        // Approve Permit2
        pengoToken.approve(address(permit2), type(uint256).max);
        permit2.approve(address(pengoToken), address(positionManager), type(uint160).max, type(uint48).max);
        
        // Mint position
        bytes memory actions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));
        bytes[] memory params = new bytes[](2);
        params[0] = abi.encode(
            poolKey, 
            tickLower, 
            tickUpper, 
            uint256(liquidity), 
            uint128(ethBalance), 
            uint128(TOKENS_FOR_LIQUIDITY), 
            strategyVault, // receiver of the NFT
            ""
        );
        params[1] = abi.encode(currency0, currency1); // For SETTLE_PAIR decodeCurrencyPair
        
        positionManager.modifyLiquidities{value: ethBalance}(
            abi.encode(actions, params),
            block.timestamp
        );
        
        emit LiquidityMigrated(ethBalance, TOKENS_FOR_LIQUIDITY, liquidity);

        // Burn any remaining tokens (due to tax or early curve completion)
        uint256 remainingTokens = pengoToken.balanceOf(address(this));
        if (remainingTokens > 0) {
            // Transfer to the standard dead address to permanently remove them from circulation
            pengoToken.transfer(0x000000000000000000000000000000000000dEaD, remainingTokens);
        }
    }
}
