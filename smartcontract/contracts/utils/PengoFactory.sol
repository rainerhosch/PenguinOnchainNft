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

import "../libraries/base64.sol";
import "../libraries/pengoConverter.sol";
import "../interfaces/IPengoFactory.sol";
import "../interfaces/IPenguinOnchain.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PengoFactory is IPengoFactory, Ownable {
    using Strings for uint256;
    
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

    constructor() {}

    function tokenURI(
        uint256 tokenId,
        uint256 seed
    ) external view virtual returns (string memory) {
        // Get Color for Base Trait
        Color memory baseColor = getBaseColor("Body", seed);
        Color memory topEyeColor = getBaseColor("top_eye", seed);

        (IPenguinOnchain.Accessory[] memory accessories,IPenguinOnchain.SpecialTrait memory specialTraits) = pengoContract.getNFTDetails(tokenId);
        string memory rawPengo = string(
            abi.encodePacked(
                '<svg shape-rendering="crispEdges" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">',
                '<rect width="100%" height="100%" fill="#7556a8"/>'
            )
        );

        // Get all pixel data on array uint256[]
        
        rawPengo = string(abi.encodePacked(rawPengo, parsePixelData(BYTE_BODY, baseColor.value)));
        rawPengo = string(abi.encodePacked(rawPengo, parsePixelData(BYTE_BELLY, "")));
        rawPengo = string(abi.encodePacked(rawPengo, parsePixelData(BYTE_BILL, "")));
        rawPengo = string(abi.encodePacked(rawPengo, parsePixelData(BYTE_TOP_EYE, topEyeColor.value)));
        rawPengo = string(abi.encodePacked(rawPengo, parsePixelData(BYTE_BOT_EYE, "")));
        rawPengo = string(abi.encodePacked(rawPengo, parsePixelData(BYTE_FEET, "")));
        


        string memory accessoriesCollected = "";
        // Looping for accessories
        for (uint256 i = 0; i < accessories.length; i++) {
            rawPengo = string(abi.encodePacked(rawPengo, parsePixelData(accessories[i].bytePixel, "")));

            // Add metadata accessories
            accessoriesCollected = string(
                abi.encodePacked(
                    accessoriesCollected,
                    bytes(accessoriesCollected).length > 0 ? "," : "", // Tambahkan koma jika bukan data pertama
                    '{"trait_type": "', accessories[i].trait_type, '", "value": "', accessories[i].trait_name, '"}'
                )
            );
        }

        rawPengo = string(abi.encodePacked(rawPengo, SVG_END_TAG));

        // create metadata
        string memory metadata = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        "{",
                        '"name": "Pengo #', tokenId.toString(), '",',
                        '"description": "Penguin Onchain is an innovative on-chain NFT project that pushes the boundaries of generative art and blockchain customization. Unlike traditional NFT collections that are pre-generated and stored off-chain, every Penguin NFT is generated using an algorithm directly on the blockchain, ensuring true decentralization and immutability.",',
                        '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(rawPengo)), '",',
                        '"attributes": [',
                        '{"trait_type": "Pengo Type", "value": "', baseColor.name, '"},',
                        '{"trait_type": "Life Goal", "value": "', specialTraits.category, '"},',
                        '{"trait_type": "Net Worth", "value": "', specialTraits.networth, '"}',
                        bytes(accessoriesCollected).length > 0 ? "," : "",
                        accessoriesCollected,
                        "]"
                        "}"
                    )
                )
            )
        );

        return
            string(abi.encodePacked("data:application/json;base64,", metadata));
    }


    function parsePixelData(string memory _datapixel, string memory customColor) internal pure returns (string memory) {
        bytes memory data = PengoConverter.hexStringToBytes(_datapixel);
        // uint256 length = data.length;
        require(data.length % 7 == 0, "Invalid pixel data length");
        string memory svgPart = "";

        uint256 numPixels = data.length / 7;
        uint256[] memory pixels = new uint256[](numPixels * 4); // 4 element per pixel (x, y, w, h)
        string[] memory colors = new string[](numPixels); //1 element for color pixel

        for (uint256 i = 0; i < numPixels; i++) {
            uint256 offset = i * 7; // one pixel  is 7 bytes

            pixels[i * 4] = uint8(data[offset]);   // x
            pixels[i * 4 + 1] = uint8(data[offset + 1]);   // y
            pixels[i * 4 + 2] = uint8(data[offset + 2]);   // width
            pixels[i * 4 + 3] = uint8(data[offset + 3]);   // height
            colors[i] = string(abi.encodePacked(
                PengoConverter.toHexChar(data[offset + 4]),
                PengoConverter.toHexChar(data[offset + 5]),
                PengoConverter.toHexChar(data[offset + 6])
            )); //color
        
        }

        for (uint256 i = 0; i < pixels.length; i += 4) {  // Loop per pixel
            uint256 x = pixels[i];
            uint256 y = pixels[i + 1];
            uint256 w = pixels[i + 2];
            uint256 h = pixels[i + 3];

            string memory colorHex = colors[i / 4];
            if (bytes(customColor).length > 0) {
                colorHex = customColor;
            }

            svgPart = string(abi.encodePacked(
                svgPart,
                "<rect x='", PengoConverter.uintToString(x),
                "' y='", PengoConverter.uintToString(y),
                "' width='", PengoConverter.uintToString(w),
                "' height='", PengoConverter.uintToString(h),
                "' fill='#", colorHex, "'/>"
            ));
        }

        return svgPart;
    }

    
    function getBaseColor(
        string memory part,
        uint256 _seed
    ) private pure returns (Color memory) {
        uint256 maxSupply = 20000;
        uint256 seed = _seed % maxSupply;

        if (keccak256(abi.encodePacked(part)) == keccak256(abi.encodePacked("Body"))) {
            uint256 remainingSupply = maxSupply;
            
            if (seed < 300) {
                return Color("Zombie", "304a12"); // 300 NFT
            }
            remainingSupply -= 300;

            if (seed < 1000) {
                return Color("Arctic", "52A0FF"); // 700 NFT
            }
            remainingSupply -= 700;

            if (seed < 2500) {
                return Color("Fire", "990718"); // 1500 NFT
            }
            remainingSupply -= 1500;

            uint256 femaleSupply = remainingSupply / 2;
            if (seed < 2500 + femaleSupply) {
                return Color("Female", "9B9B9B");
            } else {
                return Color("Male", "4B4C4F");
            }
        }

        if (keccak256(abi.encodePacked(part)) == keccak256(abi.encodePacked("top_eye"))) {
            Color memory baseColor = getBaseColor("Body", _seed); 

            if (keccak256(abi.encodePacked(baseColor.name)) == keccak256(abi.encodePacked("Zombie"))) {
                return Color("Zombie Eye", "D74755"); // 300 NFT only for Zombie
            }

            uint256 remainingSupply = maxSupply - 300; // After getting Zombie type
            uint256 ancestorsSupply = (remainingSupply * 5) / 100;  // 985 NFT (5% from remainingSupply)
            uint256 sleepySupply = (remainingSupply * 10) / 100;    // 1970 NFT (10% from remainingSupply)
            uint256 purpleShadeSupply = (remainingSupply * 30) / 100; // 5910 NFT (30% from remainingSupply)

            if (seed < 300 + ancestorsSupply) {
                return Color("Ancestors", "B0B0B0"); 
            } else if (seed < 300 + ancestorsSupply + sleepySupply) {
                return Color("Sleepy", "4872A4");
            } else if (seed < 300 + ancestorsSupply + sleepySupply + purpleShadeSupply) {
                return Color("Purple Shade", "A867E1");
            } else {
                return Color("Standard", "FFFFFF"); 
            }
        }


        return Color("Unknown", "000000");
    }


    function setPengoContract(address _pengoContract) external {
        pengoContract = IPenguinOnchain(_pengoContract);
    }
}
