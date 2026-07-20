// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title pengoConverter
/// @author Penguin Onchain Lab
/// @notice Encoding helpers for hex / string / pixel pipelines (gas-tuned)
library PengoConverter {
    /// @dev Two hex chars as a short string (kept for parsePixelData compatibility)
    function toHexChar(bytes1 b) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789ABCDEF";
        bytes memory str = new bytes(2);
        str[0] = alphabet[uint8(b) >> 4];
        str[1] = alphabet[uint8(b) & 0x0f];
        return string(str);
    }

    /// @dev Hex string → bytes (unchecked index math after length validation)
    function hexStringToBytes(string memory s) internal pure returns (bytes memory) {
        bytes memory strBytes = bytes(s);
        uint256 len = strBytes.length;
        require(len % 2 == 0, "Invalid hex string length");
        uint256 outLen = len / 2;
        bytes memory result = new bytes(outLen);

        for (uint256 i; i < outLen; ) {
            result[i] = bytes1(
                uint8(
                    parseHexChar(strBytes[2 * i]) * 16 + parseHexChar(strBytes[2 * i + 1])
                )
            );
            unchecked {
                ++i;
            }
        }
        return result;
    }

    function parseHexChar(bytes1 c) internal pure returns (uint8) {
        uint8 u = uint8(c);
        if (u >= 48 && u <= 57) {
            return u - 48; // 0-9
        }
        if (u >= 65 && u <= 70) {
            return u - 55; // A-F
        }
        if (u >= 97 && u <= 102) {
            return u - 87; // a-f
        }
        revert("Invalid hex character");
    }

    /// @dev Small-int fast path for SVG coords (0-255 typical)
    function uintToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        if (_i < 10) {
            bytes memory b1 = new bytes(1);
            b1[0] = bytes1(uint8(48 + _i));
            return string(b1);
        }
        if (_i < 100) {
            bytes memory b2 = new bytes(2);
            b2[0] = bytes1(uint8(48 + _i / 10));
            b2[1] = bytes1(uint8(48 + (_i % 10)));
            return string(b2);
        }
        if (_i < 1000) {
            bytes memory b3 = new bytes(3);
            b3[0] = bytes1(uint8(48 + _i / 100));
            b3[1] = bytes1(uint8(48 + (_i / 10) % 10));
            b3[2] = bytes1(uint8(48 + (_i % 10)));
            return string(b3);
        }

        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            unchecked {
                ++length;
                j /= 10;
            }
        }
        bytes memory bstr = new bytes(length);
        uint256 k = _i;
        while (k != 0) {
            unchecked {
                --length;
            }
            bstr[length] = bytes1(uint8(48 + (k % 10)));
            unchecked {
                k /= 10;
            }
        }
        return string(bstr);
    }
}
