// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FixedPointMathLib} from "solady/src/utils/FixedPointMathLib.sol";

contract MockRWAInitializer {
    IPoolManager public poolManager;
    IPositionManager public positionManager;
    IAllowanceTransfer public permit2;

    constructor(address _pm, address _posm, address _permit2) {
        poolManager = IPoolManager(_pm);
        positionManager = IPositionManager(_posm);
        permit2 = IAllowanceTransfer(_permit2);
    }

    function initAndAddLiquidity(address token, uint256 tokenAmount) external payable {
        Currency currency0 = CurrencyLibrary.ADDRESS_ZERO;
        Currency currency1 = Currency.wrap(token);

        if (uint160(Currency.unwrap(currency0)) > uint160(Currency.unwrap(currency1))) {
            (currency0, currency1) = (currency1, currency0);
        }

        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);

        uint24 fee = 3000;
        int24 tickSpacing = 60;

        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0))
        });
        
        uint256 ethAmount = msg.value;
        uint160 sqrtPriceX96;
        if (Currency.unwrap(currency0) == address(0)) {
            uint256 ratioX192 = FullMath.mulDiv(tokenAmount, 1 << 192, ethAmount);
            sqrtPriceX96 = uint160(FixedPointMathLib.sqrt(ratioX192));
        } else {
            uint256 ratioX192 = FullMath.mulDiv(ethAmount, 1 << 192, tokenAmount);
            sqrtPriceX96 = uint160(FixedPointMathLib.sqrt(ratioX192));
        }

        poolManager.initialize(poolKey, sqrtPriceX96);

        int24 tickLower = (TickMath.MIN_TICK / tickSpacing) * tickSpacing;
        int24 tickUpper = (TickMath.MAX_TICK / tickSpacing) * tickSpacing;

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtPriceX96,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            Currency.unwrap(currency0) == address(0) ? ethAmount : tokenAmount,
            Currency.unwrap(currency0) == address(0) ? tokenAmount : ethAmount
        );

        IERC20(token).approve(address(permit2), type(uint256).max);
        permit2.approve(token, address(positionManager), type(uint160).max, type(uint48).max);

        bytes memory actions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));
        bytes[] memory params = new bytes[](2);
        params[0] = abi.encode(
            poolKey, 
            tickLower, 
            tickUpper, 
            uint256(liquidity), 
            uint128(Currency.unwrap(currency0) == address(0) ? ethAmount : tokenAmount), 
            uint128(Currency.unwrap(currency0) == address(0) ? tokenAmount : ethAmount), 
            msg.sender, 
            ""
        );
        params[1] = abi.encode(currency0, currency1);
        
        positionManager.modifyLiquidities{value: msg.value}(
            abi.encode(actions, params),
            block.timestamp
        );
    }
}
