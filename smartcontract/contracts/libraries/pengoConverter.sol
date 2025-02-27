// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

/// @title pengoConverter
/// @author Penguin Onchain Lab
/// @notice Provides functions for encoding/decoding unit like byte, string, hex
library PengoConverter {

    // this function is for convert bytes into hex string
    function toHexString(bytes memory data) internal pure returns (string memory) {
        bytes memory HEX = "0123456789ABCDEF";
        bytes memory str = new bytes(2 * data.length);

        for (uint256 i = 0; i < data.length; i++) {
            str[2 * i] = HEX[uint8(data[i]) >> 4];  // Get 4 bit at the top
            str[2 * i + 1] = HEX[uint8(data[i]) & 0x0f];  // Get 4 bit at the bottom
        }
        
        return string(str);
    }

    
    // this function is for convert bytes into hex string it's seem at toHexString but i need to test the speed
    function toHexChar(bytes1 b) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789ABCDEF";
        bytes memory str = new bytes(2);
        str[0] = alphabet[uint8(b) >> 4];
        str[1] = alphabet[uint8(b) & 0x0f];
        return string(str);
    }
    

    // this function is for convert hex string to bytes
    function hexStringToBytes(string memory s) internal pure returns (bytes memory) {
        bytes memory strBytes = bytes(s);
        require(strBytes.length % 2 == 0, "Invalid hex string length"); // Harus genap
        bytes memory result = new bytes(strBytes.length / 2);

        for (uint i = 0; i < strBytes.length / 2; i++) {
            result[i] = bytes1(uint8(parseHexChar(strBytes[2 * i]) * 16 + parseHexChar(strBytes[2 * i + 1])));
        }

        return result;
    }

    // this function is for parse Hex to Char
    function parseHexChar(bytes1 c) internal pure returns (uint8) {
        if (uint8(c) >= 48 && uint8(c) <= 57) {
            return uint8(c) - 48; // '0' - '9'
        } else if (uint8(c) >= 65 && uint8(c) <= 70) {
            return uint8(c) - 55; // 'A' - 'F'
        } else if (uint8(c) >= 97 && uint8(c) <= 102) {
            return uint8(c) - 87; // 'a' - 'f'
        } else {
            revert("Invalid hex character");
        }
    }

    // this function is for convert uint base to String
    function uintToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        while (_i != 0) {
            length -= 1;
            bstr[length] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    function reconstructHexString(uint256[] memory pixels, string[] memory colors) public pure returns (string memory) {
        require(pixels.length % 4 == 0, "Invalid pixel data");
        require(colors.length == pixels.length / 4, "Pixel and color mismatch");

        bytes memory result;

        for (uint256 i = 0; i < colors.length; i++) {
            bytes memory pixelData = abi.encodePacked(
                bytes1(uint8(pixels[i * 4])),       // x
                bytes1(uint8(pixels[i * 4 + 1])),   // y
                bytes1(uint8(pixels[i * 4 + 2])),   // w
                bytes1(uint8(pixels[i * 4 + 3]))    // h
            );

            // Get color string and then conver into bytes
            bytes memory colorBytes = bytes(colors[i]);

            // Combine pixelDatas and colorBytes
            result = abi.encodePacked(result, pixelData, colorBytes);
        }

        return toHexString(result);
    }

}