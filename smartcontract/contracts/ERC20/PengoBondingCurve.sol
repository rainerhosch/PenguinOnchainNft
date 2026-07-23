// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

contract PengoBondingCurve is Ownable {
    IERC20 public pengoToken;
    IUniswapV2Router02 public uniswapRouter;
    
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

    constructor(address _pengoToken, address _uniswapRouter, address _strategyVault, uint256 _targetLiquidity) {
        pengoToken = IERC20(_pengoToken);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
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
        
        pengoToken.approve(address(uniswapRouter), TOKENS_FOR_LIQUIDITY);
        
        // Add liquidity to Uniswap. LP tokens are sent directly to the Strategy Vault!
        (uint amountToken, uint amountETH, uint liquidity) = uniswapRouter.addLiquidityETH{value: ethBalance}(
            address(pengoToken),
            TOKENS_FOR_LIQUIDITY, // Only pair exactly the designated amount, ensuring perfect price jump
            0, // accept any amount of token
            0, // accept any amount of ETH
            strategyVault,
            block.timestamp + 300
        );
        
        emit LiquidityMigrated(amountETH, amountToken, liquidity);

        // Burn any remaining tokens (due to tax or early curve completion)
        uint256 remainingTokens = pengoToken.balanceOf(address(this));
        if (remainingTokens > 0) {
            // Transfer to the standard dead address to permanently remove them from circulation
            pengoToken.transfer(0x000000000000000000000000000000000000dEaD, remainingTokens);
        }
    }
}
