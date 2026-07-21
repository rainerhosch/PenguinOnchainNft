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
    
    uint256 public constant TARGET_LIQUIDITY = 1 ether; 
    uint256 public constant TOKENS_FOR_SALE = 800_000_000 * 1e18;
    uint256 public constant TOKENS_FOR_LIQUIDITY = 200_000_000 * 1e18;
    
    uint256 public basePrice = 500000015; // ~0.5 Gwei in wei
    uint256 public priceIncrement = 30; // 30 wei
    
    uint256 public tokensSold;
    bool public isMigrated;
    
    address public strategyVault;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensSold(address indexed seller, uint256 amount, uint256 returnEth, uint256 taxEth);
    event LiquidityMigrated(uint256 ethAmount, uint256 tokenAmount, uint256 lpTokens);

    constructor(address _pengoToken, address _uniswapRouter, address _strategyVault) {
        pengoToken = IERC20(_pengoToken);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        strategyVault = _strategyVault;
    }

    function getCost(uint256 amount) public view returns (uint256) {
        require(amount % 1e18 == 0, "Amount must be in full tokens");
        uint256 fullTokensToBuy = amount / 1e18;
        uint256 currentSold = tokensSold / 1e18;
        
        uint256 a = basePrice + (currentSold * priceIncrement);
        uint256 n = fullTokensToBuy;
        uint256 cost = (n * (2 * a + (n - 1) * priceIncrement)) / 2;
        return cost;
    }

    function getSellValue(uint256 amount) public view returns (uint256 returnEth, uint256 taxEth) {
        require(amount % 1e18 == 0, "Amount must be in full tokens");
        require(amount <= tokensSold, "Amount exceeds tokens sold");
        
        uint256 fullTokensToSell = amount / 1e18;
        uint256 currentSold = (tokensSold - amount) / 1e18; // we calculate area from (tokensSold - amount) to tokensSold
        
        uint256 a = basePrice + (currentSold * priceIncrement);
        uint256 n = fullTokensToSell;
        uint256 totalEthValue = (n * (2 * a + (n - 1) * priceIncrement)) / 2;
        
        taxEth = (totalEthValue * 3) / 100; // 3% tax
        returnEth = totalEthValue - taxEth;
    }

    function buy(uint256 amount) external payable {
        require(!isMigrated, "Liquidity already migrated to DEX");
        require(tokensSold + amount <= TOKENS_FOR_SALE, "Exceeds available tokens for sale");
        
        uint256 cost = getCost(amount);
        require(msg.value >= cost, "Insufficient ETH sent");
        
        tokensSold += amount;
        require(pengoToken.transfer(msg.sender, amount), "Token transfer failed");
        
        emit TokensPurchased(msg.sender, amount, cost);
        
        // Refund excess ETH
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
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
        
        pengoToken.approve(address(uniswapRouter), tokenBalance);
        
        // Add liquidity to Uniswap. LP tokens are sent directly to the Strategy Vault!
        (uint amountToken, uint amountETH, uint liquidity) = uniswapRouter.addLiquidityETH{value: ethBalance}(
            address(pengoToken),
            tokenBalance,
            0, // accept any amount of token
            0, // accept any amount of ETH
            strategyVault,
            block.timestamp + 300
        );
        
        emit LiquidityMigrated(amountETH, amountToken, liquidity);
    }
}
