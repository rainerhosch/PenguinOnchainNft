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
pragma solidity ^0.8.20;

import {Base64} from "solady/src/utils/Base64.sol";
import {LibString} from "solady/src/utils/LibString.sol";
import {DynamicBufferLib} from "solady/src/utils/DynamicBufferLib.sol";
import "../libraries/pengoConverter.sol";
import "../interfaces/IPengoFactory.sol";
import "../interfaces/IPenguinOnchain.sol";
import "../interfaces/IPengoStrategy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice On-chain SVG / metadata factory. Public structure preserved; assembly uses Solady buffers.
contract PengoFactory is IPengoFactory, Ownable {
    using DynamicBufferLib for DynamicBufferLib.DynamicBuffer;

    mapping(string => mapping(uint8 => mapping(uint8 => bool))) public pixelMapCoordinates;
    mapping(string => bool) public allowedParts;
    mapping(string => uint8[]) private partPixelsX;
    mapping(string => uint8[]) private partPixelsY;
    string[] private partKeys;
    
    struct Color {
        string name;
        string value;
    }


    string private constant SVG_END_TAG = "</svg>";

    string internal constant BYTE_BODY      = "0d0b01014A4A4A0e0a01014A4A4A0f0a01014A4A4A100a01014A4A4A110a01014A4A4A0e0b01014A4A4A0f0b01014A4A4A100b01014A4A4A110b01014A4A4A120b01014A4A4A0d0c01014A4A4A0d0d01014A4A4A0d0e01014A4A4A0e0e01014A4A4A0f0e01014A4A4A100e01014A4A4A110e01014A4A4A120e01014A4A4A120d01014A4A4A120c01014A4A4A0f0c01014A4A4A100c01014A4A4A0c0f01014A4A4A0c0e01014A4A4A0b0f01014A4A4A0a1001014A4A4A130e01014A4A4A130f01014A4A4A140f01014A4A4A0b1001014A4A4A141001014A4A4A0a1101014A4A4A0b1101014A4A4A0b1201014A4A4A0b1301014A4A4A0c1301014A4A4A0c1401014A4A4A0c1501014A4A4A0d1401014A4A4A0d1501014A4A4A0e1501014A4A4A0f1501014A4A4A101501014A4A4A111501014A4A4A121501014A4A4A131501014A4A4A141101014A4A4A141201014A4A4A141301014A4A4A131301014A4A4A131401014A4A4A151001014A4A4A151101014A4A4A121401014A4A4A0d0f01014A4A4A0c1001014A4A4A120f01014A4A4A131001014A4A4A";
    string internal constant BYTE_BELLY     = "0e0f0101FFFFFF0f0f0101FFFFFF100f0101FFFFFF110f0101FFFFFF0d100101FFFFFF0c110101FFFFFF0c120101FFFFFF0d130101FFFFFF0e140101FFFFFF0f140101FFFFFF10140101FFFFFF11140101FFFFFF12130101FFFFFF13120101FFFFFF13110101FFFFFF12100101FFFFFF0e100101FFFFFF0f100101FFFFFF10100101FFFFFF11100101FFFFFF11110101FFFFFF10110101FFFFFF0f110101FFFFFF0e110101FFFFFF0d110101FFFFFF0d120101FFFFFF10120101FFFFFF11120101FFFFFF12120101FFFFFF12110101FFFFFF10130101FFFFFF0f130101FFFFFF0e130101FFFFFF0e120101FFFFFF0f120101FFFFFF11130101FFFFFF";
    string internal constant BYTE_BILL      = "0f0d0101F5A623100d0101F5A623";
    string internal constant BYTE_TOP_EYE   = "0e0c0101FFFFFF110c0101FFFFFF";
    string internal constant BYTE_BOT_EYE   = "0e0d0101000000110d0101000000";
    string internal constant BYTE_FEET      = "0d160101F5A6230e160101F5A62311160101F5A62312160101F5A623";

    IPenguinOnchain public pengoContract;
    IPengoStrategy public strategyContract;

    event CoordinatesInitialized(string part, string byteData);
    event RemovedPart(string part);

    constructor() {}

    function setStrategyContract(address _strategy) external onlyOwner {
        strategyContract = IPengoStrategy(_strategy);
    }

    function tokenURI(
        uint256 tokenId,
        uint256 seed
    ) external view virtual returns (string memory) {
        Color memory baseColor = getBaseColor("Body", seed);
        Color memory topEyeColor = getBaseColor("top_eye", seed);

        (IPenguinOnchain.Accessory[] memory accessories, IPenguinOnchain.SpecialTrait memory specialTraits) =
            pengoContract.getNFTDetails(tokenId);

        // SVG assembly via Solady DynamicBuffer (cheaper than repeated string concat)
        DynamicBufferLib.DynamicBuffer memory svg;
        svg = svg.p(
            bytes(
                '<svg shape-rendering="crispEdges" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#acff00"/>'
            )
        );
        svg = svg.p(bytes(parsePixelData(BYTE_BODY, baseColor.value)));
        svg = svg.p(bytes(parsePixelData(BYTE_BELLY, "")));
        svg = svg.p(bytes(parsePixelData(BYTE_BILL, "")));
        svg = svg.p(bytes(parsePixelData(BYTE_TOP_EYE, topEyeColor.value)));
        svg = svg.p(bytes(parsePixelData(BYTE_BOT_EYE, "")));
        svg = svg.p(bytes(parsePixelData(BYTE_FEET, "")));

        DynamicBufferLib.DynamicBuffer memory attrs;
        uint256 accLen = accessories.length;
        for (uint256 i; i < accLen; ) {
            svg = svg.p(bytes(parsePixelData(accessories[i].bytePixel, "")));
            if (i != 0) {
                attrs = attrs.p(bytes(","));
            }
            attrs = attrs.p(
                bytes('{"trait_type": "'),
                bytes(accessories[i].trait_type),
                bytes('", "value": "'),
                bytes(accessories[i].trait_name),
                bytes('"}')
            );
            unchecked {
                ++i;
            }
        }
        svg = svg.p(bytes(SVG_END_TAG));

        string memory imageB64 = Base64.encode(bytes(svg.s()));

        DynamicBufferLib.DynamicBuffer memory meta;
        meta = meta.p(bytes('{"name": "Pengo #'));
        meta = meta.p(bytes(LibString.toString(tokenId)));
        meta = meta.p(
            bytes(
                '","description": "Penguin Onchain is an innovative on-chain NFT project that pushes the boundaries of generative art and blockchain customization. Unlike traditional NFT collections that are pre-generated and stored off-chain, every Penguin NFT is generated using an algorithm directly on the blockchain, ensuring true decentralization and immutability.","image": "data:image/svg+xml;base64,'
            )
        );
        meta = meta.p(bytes(imageB64));
        meta = meta.p(bytes('","attributes": [{"trait_type": "Pengo Type", "value": "'));
        meta = meta.p(bytes(baseColor.name));
        meta = meta.p(bytes('"},{"trait_type": "Eye Type", "value": "'));
        meta = meta.p(bytes(topEyeColor.name));
        meta = meta.p(bytes('"},{"trait_type": "Life Goal", "value": "'));
        meta = meta.p(bytes(specialTraits.category));
        meta = meta.p(bytes('"},{"trait_type": "Net Worth", "value": "'));
        
        // Dynamic Net Worth Calculation
        uint256 totalAccValue = 0;
        for (uint256 j = 0; j < accLen; ) {
            totalAccValue += accessories[j].lastPrice;
            unchecked { ++j; }
        }
        
        uint256 totalValueWei = totalAccValue;
        if (address(strategyContract) != address(0)) {
            for (uint k = 0; ; k++) {
                try strategyContract.rewardTokens(k) returns (address rwa) {
                    uint256 claimable = strategyContract.getClaimableDividends(rwa, tokenId);
                    if (claimable > 0) {
                        // Mock conversion: 1 RWA = 0.05 ETH
                        totalValueWei += (claimable * 5e16) / 1e18;
                    }
                } catch {
                    break;
                }
            }
        }
        
        string memory combinedNetworth = string.concat(LibString.toString(totalValueWei / 1 ether), " ETH");
        meta = meta.p(bytes(combinedNetworth));
        meta = meta.p(bytes('"}'));
        if (accLen > 0) {
            meta = meta.p(bytes(","));
            meta = meta.p(bytes(attrs.s()));
        }
        meta = meta.p(bytes("]}"));

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(meta.s()))));
    }

    function _createContractURI() external view virtual returns (string memory) {
        DynamicBufferLib.DynamicBuffer memory meta;
        meta = meta.p(
            bytes(
                '{"name": "Penguin Onchain","description": "Penguin Onchain is an innovative on-chain NFT project that pushes the boundaries of generative art and blockchain customization. Unlike traditional NFT collections that are pre-generated and stored off-chain, every Penguin NFT is generated using an algorithm directly on the blockchain, ensuring true decentralization and immutability.","image": "https://penguinonchain.top/pengo-icon.png","external_url": "https://penguinonchain.top","seller_fee_basis_points": "500","fee_recipient": "'
            )
        );
        meta = meta.p(bytes(LibString.toHexStringChecksummed(owner())));
        meta = meta.p(bytes('"}'));

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(meta.s()))));
    }

    /// @dev Pixel hex → SVG rects using DynamicBuffer + LibString (same 7-byte pixel layout).
    function parsePixelData(string memory _datapixel, string memory customColor)
        internal
        pure
        returns (string memory)
    {
        bytes memory data = PengoConverter.hexStringToBytes(_datapixel);
        require(data.length % 7 == 0, "Invalid pixel data length");

        uint256 numPixels = data.length / 7;
        bool useCustom = bytes(customColor).length > 0;

        DynamicBufferLib.DynamicBuffer memory buf;
        // Rough reserve: ~48 bytes per rect
        buf = buf.reserve(numPixels * 48);

        for (uint256 i; i < numPixels; ) {
            uint256 offset = i * 7;
            string memory colorHex = useCustom
                ? customColor
                : string(
                    abi.encodePacked(
                        PengoConverter.toHexChar(data[offset + 4]),
                        PengoConverter.toHexChar(data[offset + 5]),
                        PengoConverter.toHexChar(data[offset + 6])
                    )
                );

            buf = buf.p(bytes("<rect x='"));
            buf = buf.p(bytes(LibString.toString(uint256(uint8(data[offset])))));
            buf = buf.p(bytes("' y='"));
            buf = buf.p(bytes(LibString.toString(uint256(uint8(data[offset + 1])))));
            buf = buf.p(bytes("' width='"));
            buf = buf.p(bytes(LibString.toString(uint256(uint8(data[offset + 2])))));
            buf = buf.p(bytes("' height='"));
            buf = buf.p(bytes(LibString.toString(uint256(uint8(data[offset + 3])))));
            buf = buf.p(bytes("' fill='#"));
            buf = buf.p(bytes(colorHex));
            buf = buf.p(bytes("'/>"));

            unchecked {
                ++i;
            }
        }

        return buf.s();
    }

    
    // Precomputed name hashes — avoid re-hashing string literals on every call
    bytes32 private constant _HASH_BODY = keccak256("Body");
    bytes32 private constant _HASH_TOP_EYE = keccak256("top_eye");
    bytes32 private constant _HASH_ZOMBIE = keccak256("Zombie");

    function getBaseColor(
        string memory part,
        uint256 _seed
    ) private pure returns (Color memory) {
        uint256 maxSupply = 50000;
        uint256 seed = _seed % maxSupply;
        bytes32 partHash = keccak256(bytes(part));

        if (partHash == _HASH_BODY) {
            if (seed < 300) {
                return Color("Zombie", "304a12");
            }
            if (seed < 1000) {
                return Color("Arctic", "52A0FF");
            }
            if (seed < 2500) {
                return Color("Fire", "990718");
            }
            uint256 femaleSupply = (maxSupply - 2500) / 2;
            if (seed < 2500 + femaleSupply) {
                return Color("Female", "9B9B9B");
            }
            return Color("Male", "4B4C4F");
        }

        if (partHash == _HASH_TOP_EYE) {
            Color memory baseColor = getBaseColor("Body", _seed);

            if (keccak256(bytes(baseColor.name)) == _HASH_ZOMBIE) {
                return Color("Zombie Eye", "D74755");
            }

            uint256 remainingSupply = maxSupply - 300;
            uint256 ancestorsSupply = (remainingSupply * 5) / 100;
            uint256 sleepySupply = (remainingSupply * 10) / 100;
            uint256 purpleShadeSupply = (remainingSupply * 30) / 100;

            if (seed < 300 + ancestorsSupply) {
                return Color("Ancestors", "B0B0B0");
            }
            if (seed < 300 + ancestorsSupply + sleepySupply) {
                return Color("Sleepy", "4872A4");
            }
            if (seed < 300 + ancestorsSupply + sleepySupply + purpleShadeSupply) {
                return Color("Purple Shade", "A867E1");
            }
            return Color("Standard", "FFFFFF");
        }

        return Color("Unknown", "000000");
    }


    function setPengoContract(address _pengoContract) external onlyOwner {
        require(_pengoContract != address(0), "zero address");
        pengoContract = IPenguinOnchain(_pengoContract);
    }

    /*---------------------------------------------------------------------
    *                        Coordinate Setup
    ---------------------------------------------------------------------*/

    function removeAllowedPart(string memory part) public onlyOwner {
        require(allowedParts[part], "Part not found");
        delete allowedParts[part];
        // delete pixelMapCoordinates[part];
        for (uint8 x = 0; x < 255; x++) {
            for (uint8 y = 0; y < 255; y++) {
                if (pixelMapCoordinates[part][x][y]) {
                    delete pixelMapCoordinates[part][x][y];
                }
            }
        }
        delete partPixelsX[part];
        delete partPixelsY[part];
        for (uint256 i = 0; i < partKeys.length; i++) {
            if (
                keccak256(abi.encodePacked(partKeys[i])) ==
                keccak256(abi.encodePacked(part))
            ) {
                partKeys[i] = partKeys[partKeys.length - 1];
                partKeys.pop();
                break;
            }
        }
        emit RemovedPart(part);
    }

    function initializeCoordinates(
        string memory part,
        string memory byteData
    ) public onlyOwner {
        require(!allowedParts[part], "Part already initialized");
        bytes memory data = PengoConverter.hexStringToBytes(byteData);

        uint256 numPixels = data.length / 7;
        for (uint256 i = 0; i < numPixels; i++) {
            uint256 offset = i * 7;
            uint8 x = uint8(data[offset]); // x
            uint8 y = uint8(data[offset + 1]); // y
            pixelMapCoordinates[part][x][y] = true;
            partPixelsX[part].push(x);
            partPixelsY[part].push(y);
        }
        allowedParts[part] = true;
        partKeys.push(part); // Store the key for retrieval
        emit CoordinatesInitialized(part, byteData);
    }
    // Function to retrieve all allowed parts
    function getAllAllowedParts() public view returns (string[] memory) {
        string[] memory parts = new string[](partKeys.length);

        for (uint256 i = 0; i < partKeys.length; i++) {
            parts[i] = partKeys[i];
        }
        return parts;
    }

    function isAllowedPart(string calldata part) external view returns (bool) {
        return allowedParts[part];
    }

    function isValidCoordinate(
        string calldata part,
        uint8 x,
        uint8 y
    ) public view returns (bool) {
        require(allowedParts[part], "Part not allowed!");
        return pixelMapCoordinates[part][x][y];
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

    function getPixelPart(
        string memory part
    ) public view returns (uint256[] memory xCoords, uint256[] memory yCoords) {
        require(allowedParts[part], "Part not allowed!");

        uint256 length = partPixelsX[part].length;
        xCoords = new uint256[](length);
        yCoords = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            xCoords[i] = partPixelsX[part][i];
            yCoords[i] = partPixelsY[part][i];
        }
    }
}
