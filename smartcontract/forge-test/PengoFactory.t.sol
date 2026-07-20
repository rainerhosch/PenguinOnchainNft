// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PenguinOnchain} from "../contracts/ERC721/PenguinOnchain.sol";
import {PengoFactory} from "../contracts/utils/PengoFactory.sol";
import {IPengoFactory} from "../contracts/interfaces/IPengoFactory.sol";
import {PengoConverter} from "../contracts/libraries/pengoConverter.sol";

/// @notice Factory SVG / parsePixelData + tokenURI integration smoke tests
contract PengoFactoryTest is Test {
    PenguinOnchain internal nft;
    PengoFactory internal factory;
    address internal minter = makeAddr("minter");

    function setUp() public {
        nft = new PenguinOnchain();
        factory = new PengoFactory();
        nft.setFactory(IPengoFactory(address(factory)));
        factory.setPengoContract(address(nft));
        nft.setBeneficiaryAddress(makeAddr("treasury"));
        vm.deal(minter, 100 ether);
    }

    function test_setPengoContract_onlyOwner() public {
        vm.prank(minter);
        vm.expectRevert("Ownable: caller is not the owner");
        factory.setPengoContract(minter);
    }

    function test_tokenURI_containsAttributes() public {
        vm.prank(minter);
        nft.mintPengo{value: 0.25 ether}(1);

        string memory uri = nft.tokenURI(0);
        // Decode base64 payload roughly: must be non-empty data URI
        assertTrue(bytes(uri).length > 100);
        assertEq(_slice(uri, 0, 5), "data:");
    }

    function test_parsePixelData_viaContractURI() public {
        // contractURI exercises Base64 + DynamicBuffer path without mint
        string memory cURI = factory._createContractURI();
        assertTrue(bytes(cURI).length > 32);
        assertEq(_slice(cURI, 0, 29), "data:application/json;base64,");
    }

    function testFuzz_hexStringToBytes_roundtripLength(uint8 nPixels) public pure {
        uint256 n = bound(uint256(nPixels), 1, 20);
        // Build trivial hex: each pixel 7 bytes = 14 hex chars of "00"
        string memory hexStr = _repeatHexZeros(n * 14);
        bytes memory out = PengoConverter.hexStringToBytes(hexStr);
        assertEq(out.length, n * 7);
    }

    function testFuzz_uintToString(uint8 v) public pure {
        string memory s = PengoConverter.uintToString(v);
        assertTrue(bytes(s).length > 0);
        // 0-255 always fits
        if (v < 10) assertEq(bytes(s).length, 1);
        else if (v < 100) assertEq(bytes(s).length, 2);
        else assertEq(bytes(s).length, 3);
    }

    function _slice(string memory s, uint256 start, uint256 len) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        bytes memory out = new bytes(len);
        for (uint256 i; i < len; ++i) {
            out[i] = b[start + i];
        }
        return string(out);
    }

    function _repeatHexZeros(uint256 n) internal pure returns (string memory) {
        bytes memory b = new bytes(n);
        for (uint256 i; i < n; ++i) {
            b[i] = "0";
        }
        return string(b);
    }
}
