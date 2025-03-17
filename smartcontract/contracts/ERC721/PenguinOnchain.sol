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
* ** package : @contracts/ERC721/PengoFactory.sol
*/
pragma solidity ^0.8.0;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IPengoFactory.sol";
import "../interfaces/IPenguinOnchain.sol";
import "../libraries/pengoConverter.sol";

contract PenguinOnchain is
    ERC721AQueryable,
    Ownable,
    ReentrancyGuard,
    IPenguinOnchain
{
    using Strings for uint256;
    IPengoFactory public factory;

    uint256 public constant MAX_SUPPLY = 20000;
    uint256 public constant MINT_PRICE = 0.25 ether;
    uint256 public constant MAX_MINT_PER_WALLET = 100;
    uint256 public constant ROYALTY_PERCENT = 5;
    address public BENEFICARY_ADDRESS;
    address public ROYALTY_ADDRESS;


    uint256 public nextAccessoryId = 1;
    mapping(uint256 => uint256) internal seeds;
    mapping(address => uint256) public mintedCount;
    mapping(uint256 => SpecialTrait) public specialTraits;
    mapping(uint256 => mapping(uint256 => Accessory)) public accessories;
    mapping(uint256 => uint256[]) public accessoryIds;
    mapping(uint256 => mapping(string => bool)) private accessoryOfTokenExists;

    // offer mapping
    uint256 public totalOfferBalance;
    mapping(uint256 => mapping(uint256 => Offer)) public offers;
    mapping(address => uint256) public offerBalances; //safety offer fund
    AccessoryForSale[] public accessoriesForSale;

    event AccessoryAdded(
        uint256 indexed tokenId,
        string trait_type,
        uint256 accessoryId
    );
    event AccessoryListed(uint256 indexed accessoryId, uint256 price);
    event AccessoryDeleted(uint256 indexed accessoryId,uint256 indexed fromTokenId);
    event AccessorySold(string accessoryType, uint256 indexed accessoryId, uint256 indexed fromTokenId, uint256 indexed toTokenId, address seller, address buyer, uint256 price);
    event AccessorySaleCancelled(uint256 indexed accessoryId, address accessoryOwner);
    event AccessoryOfferMade(
        uint256 indexed accessoryId,
        uint256 indexed fromTokenId,
        uint256 indexed toTokenId,
        address buyer,
        uint256 price
    );
    event AccessoryOfferCancelled(
        uint256 indexed accessoryId,
        uint256 indexed fromTokenId,
        uint256 indexed toTokenId,
        address buyer,
        uint256 price
    );

    constructor() ERC721A("Penguin Onchain", "Pengo") {
        BENEFICARY_ADDRESS = owner();
        ROYALTY_ADDRESS = owner();
    }

    function mintPengo(
        uint256 _mintAmount
    ) public payable nonReentrant returns (uint256[] memory) {
        require(totalSupply() < MAX_SUPPLY, "Sold out");
        require(
            msg.value >= _mintAmount * MINT_PRICE,
            "Insufficient payment for minting"
        );
        require(
            mintedCount[msg.sender] < MAX_MINT_PER_WALLET,
            "Max mint per wallet reached"
        );

        _genSeed(_mintAmount);
        _safeMint(msg.sender, _mintAmount);

        mintedCount[msg.sender]++;
        uint256[] memory newTokenIds = new uint256[](_mintAmount);
        for (uint256 i = 0; i < _mintAmount; i++) {
            newTokenIds[i] = totalSupply() + i;
            updateTraits(newTokenIds[i]);
        }
        if (address(this).balance > 0) {
            payable(BENEFICARY_ADDRESS).transfer(address(this).balance);
        }
        return newTokenIds;
    }

    /*---------------------------------------------------------------------
    *                     Accessory Function and Logic
    ---------------------------------------------------------------------*/
    function addAccessory(
        uint256 tokenId,
        string memory trait_type,
        string memory trait_name,
        string memory byteCode
    ) public {
        bytes memory data = PengoConverter.hexStringToBytes(byteCode);
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(factory.isAllowedPart(trait_type), "Part does not exist");
        require(data.length % 7 == 0, "Invalid pixel data length"); // 7 bytes per pixel
        require(
            !accessoryOfTokenExists[tokenId][trait_type],
            "Accessory slot already filled"
        );

        // Generate new accessory ID safely
        uint256 accessoryId = nextAccessoryId;
        nextAccessoryId++;


        uint256 numPixels = data.length / 7;
        uint256 validCount = 0;

        // First, count the number of valid pixels so as not to waste memory.
        for (uint256 i = 0; i < numPixels; i++) {
            uint256 offset = i * 7;
            if (
                factory.isValidCoordinate(
                    trait_type,
                    uint8(data[offset]),
                    uint8(data[offset + 1])
                )
            ) {
                validCount++;
            }
        }

        // Alocation memory only for valid pixel
        uint256[] memory pixels = new uint256[](validCount * 4);
        string[] memory colors = new string[](validCount);
        uint256 counter = 0;

        // Iteration to save valid pixel
        for (uint256 i = 0; i < numPixels; i++) {
            uint256 offset = i * 7;
            uint8 x = uint8(data[offset]);
            uint8 y = uint8(data[offset + 1]);

            if (factory.isValidCoordinate(trait_type, x, y)) {
                pixels[counter * 4] = x; // x
                pixels[counter * 4 + 1] = y; // y
                pixels[counter * 4 + 2] = uint8(data[offset + 2]); // width
                pixels[counter * 4 + 3] = uint8(data[offset + 3]); // height

                colors[counter] = string(
                    abi.encodePacked(
                        data[offset + 4],
                        data[offset + 5],
                        data[offset + 6]
                    )
                );
                counter++;
            }
        }

        // Convert back to format hex for saving datas
        string memory validByte = factory.reconstructHexString(
            pixels,
            colors
        );

        // Save accessory data to mapping
        accessories[tokenId][accessoryId] = Accessory({
            accessoryId: accessoryId,
            trait_type: trait_type,
            trait_name: trait_name,
            bytePixel: validByte,
            sellingPrice: 0,
            lastPrice: 0,
            owner: msg.sender,
            forSale: false
        });

        accessoryIds[tokenId].push(accessoryId);


        updateTraits(tokenId);
        accessoryOfTokenExists[tokenId][trait_type] = true;

        emit AccessoryAdded(
            tokenId,
            trait_type,
            accessoryId
        );
    }

    function listAccessoryForSale(
        uint256 tokenId,
        uint256 accessoryId,
        uint256 price
    ) public {
        require(accessories[tokenId][accessoryId].owner == msg.sender,"Not the owner of this accessory" );
        require(!accessories[tokenId][accessoryId].forSale, "This accessory is already on sale."); 

        accessories[tokenId][accessoryId].sellingPrice = price;
        accessories[tokenId][accessoryId].forSale = true;

        accessoriesForSale.push(
            AccessoryForSale({
                tokenId: tokenId,
                accessoryId: accessoryId,
                accessory:  accessories[tokenId][accessoryId]
            })
        );
        
        emit AccessoryListed(accessoryId, price);
    }

    function removeAccesory(
        uint256 tokenId, 
        uint256 accessoryId
    ) public {
        require(accessories[tokenId][accessoryId].owner == msg.sender, "Not the owner");
        _saveRemoveAccessory(tokenId, accessoryId);
    }

    function _saveRemoveAccessory(uint256 fromTokenId, uint256 accessoryId) private {
        if(accessories[fromTokenId][accessoryId].forSale){
            removeAccessoryFromSale(fromTokenId, accessoryId);
        }

        // Delete from mapping
        delete accessories[fromTokenId][accessoryId];

        // Delete from list accessoryIds[fromTokenId]
        uint256 length = accessoryIds[fromTokenId].length;
        for (uint256 i = 0; i < length; i++) {
            if (accessoryIds[fromTokenId][i] == accessoryId) {
                accessoryIds[fromTokenId][i] = accessoryIds[fromTokenId][length - 1];
                accessoryIds[fromTokenId].pop();
                break;
            }
        }

        emit AccessoryDeleted(accessoryId, fromTokenId);
    }

    function getAllAccessoriesForSale()
        public
        view
        returns (AccessoryForSale[] memory)
    {
        return accessoriesForSale;
    }

    function purchaseAccessory(
        uint256 accessoryId,
        uint256 fromTokenId,
        uint256 toTokenId
    ) public payable nonReentrant {
        uint256 price = accessories[fromTokenId][accessoryId].sellingPrice;
        string memory accessoryType = accessories[fromTokenId][accessoryId].trait_type;
        require(accessories[fromTokenId][accessoryId].forSale != false, "Accessory is not for sale");
        require(msg.value >= price, "Insufficient payment");
        require(!accessoryOfTokenExists[toTokenId][accessoryType], "Accessory slot already filled");

        uint256 royalty = (price * ROYALTY_PERCENT) / 100;
        uint256 sellerAmount = price - royalty;

        address previousOwner = accessories[fromTokenId][accessoryId].owner;


        accessories[toTokenId][accessoryId] = Accessory({
                accessoryId: accessoryId,
                trait_type: accessoryType,
                trait_name: accessories[fromTokenId][accessoryId].trait_name,
                bytePixel: accessories[fromTokenId][accessoryId].bytePixel,
                sellingPrice: 0,
                lastPrice: price,
                owner: msg.sender,
                forSale: false
        });
        accessoryIds[toTokenId].push(accessoryId);

        accessoryOfTokenExists[toTokenId][accessoryType] = true;
        accessoryOfTokenExists[fromTokenId][accessoryType] = false;

        _saveRemoveAccessory(fromTokenId, accessoryId);
        updateTraits(toTokenId);
        updateTraits(fromTokenId);

        (bool successSeller, ) = payable(previousOwner).call{
            value: sellerAmount
        }("");
        require(successSeller, "Transfer to seller failed");

        (bool successRoyalty, ) = payable(owner()).call{value: royalty}("");
        require(successRoyalty, "Transfer to royalty failed");

        emit AccessorySold(accessoryType, accessoryId, fromTokenId, toTokenId, previousOwner, msg.sender, price);
        
    }

    function removeAccessoryFromSale(
        uint256 fromTokenId,
        uint256 accessoryId
    ) private {
        // Ensure the item is truly in the list of accessoriesForSale
        uint256 index = findAccessoryIndex(fromTokenId, accessoryId);
        require(index < accessoriesForSale.length, "Accessory not found in sale list");

        // Update accessory status so it is no longer for sale
        accessories[fromTokenId][accessoryId].forSale = false;
        accessories[fromTokenId][accessoryId].sellingPrice = 0;

        // Swap and pop technique to remove the item without high gas costs
        uint256 lastIndex = accessoriesForSale.length - 1;
        if (index != lastIndex) {
            accessoriesForSale[index] = accessoriesForSale[lastIndex]; // Replace with the last item
        }
        accessoriesForSale.pop(); // Remove the last element to save gas
    }

    function findAccessoryIndex(uint256 tokenId, uint256 accessoryId) public view returns (uint256) {
        for (uint256 i = 0; i < accessoriesForSale.length; i++) {
            if (
                accessoriesForSale[i].tokenId == tokenId &&
                accessoriesForSale[i].accessoryId == accessoryId
            ) {
                return i;
            }
        }
        return accessoriesForSale.length;
    }


    function makeOffer(uint256 accessoryId, uint256 fromTokenId, uint256 toTokenId) public payable nonReentrant {
        require(msg.value > 0, "Offer price must be greater than 0");
        
        require(accessories[fromTokenId][accessoryId].owner != msg.sender, "Owner cannot make an offer");
        require(!accessoryOfTokenExists[toTokenId][accessories[fromTokenId][accessoryId].trait_type],"Accessory slot already filled");

        Offer storage currentOffer = offers[fromTokenId][accessoryId];
        require(
            !currentOffer.active || msg.value > currentOffer.price,
            "Offer must be higher than the current one"
        );

        // Refund previous offer 
        if (currentOffer.active) {
            (bool success, ) = payable(currentOffer.buyer).call{
                value: currentOffer.price
            }("");
            require(success, "Refund failed");
        }

        offers[fromTokenId][accessoryId] = Offer({
            buyer: msg.sender,
            toTokenId : toTokenId,
            price: msg.value,
            active: true
        });

        offerBalances[msg.sender] += msg.value;
        totalOfferBalance += msg.value;

        emit AccessoryOfferMade(accessoryId, fromTokenId, toTokenId, msg.sender, msg.value);
    }

    function cancelOffer(uint256 accessoryId, uint256 fromTokenId) public nonReentrant {
        Offer storage currentOffer = offers[fromTokenId][accessoryId];

        require(currentOffer.active, "No active offer found");
        require(currentOffer.buyer == msg.sender, "Not your offer");

        uint256 refundAmount = currentOffer.price;
        uint256 toTokenId = currentOffer.toTokenId;

        // Reset offer
        delete offers[fromTokenId][accessoryId];

        offerBalances[msg.sender] -= refundAmount;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund failed");

        emit AccessoryOfferCancelled(accessoryId, fromTokenId, toTokenId, msg.sender, refundAmount);
    }

    function approveOffer(uint256 fromTokenId, uint256 accessoryId) public nonReentrant {
        Offer storage offer = offers[fromTokenId][accessoryId];
        require(offer.active, "No active offer");
        
        // Accessory storage accessory = accessories[fromTokenId][accessoryId];
        require(accessories[fromTokenId][accessoryId].owner == msg.sender, "Not the owner of this accessory");

        uint256 amount = offer.price;
        uint256 toTokenId = offer.toTokenId;

        accessories[toTokenId][accessoryId] = Accessory({
            accessoryId: accessoryId,
            trait_type: accessories[fromTokenId][accessoryId].trait_type,
            trait_name: accessories[fromTokenId][accessoryId].trait_name,
            bytePixel: accessories[fromTokenId][accessoryId].bytePixel,
            sellingPrice: 0,
            lastPrice: amount,
            owner: offer.buyer,
            forSale: false
        });
        accessoryIds[toTokenId].push(accessoryId);
        _saveRemoveAccessory(fromTokenId, accessoryId);
        accessoryOfTokenExists[toTokenId][accessories[fromTokenId][accessoryId].trait_type] = true;
        accessoryOfTokenExists[fromTokenId][accessories[fromTokenId][accessoryId].trait_type] = false;

        updateTraits(toTokenId);
        updateTraits(fromTokenId);


        (bool success, ) = payable(msg.sender).call{ value: amount }("");
        require(success, "Payment transfer failed");

        // Reset offer
        delete offers[fromTokenId][accessoryId];
        offerBalances[offer.buyer] -= amount;
        totalOfferBalance -= amount;

        emit AccessorySold(accessories[fromTokenId][accessoryId].trait_type, accessoryId, fromTokenId, toTokenId, msg.sender, offer.buyer, amount);
    }
        

    function updateTraits(uint256 tokenId) internal {
        uint256 totalValue = 0;
        for (uint256 i = 0; i < accessoryIds[tokenId].length; i++) {
            totalValue += accessories[tokenId][accessoryIds[tokenId][i]].lastPrice;
        }

        // Convert totalValue from wei to ether
        uint256 totalValueInEther = totalValue / 1 ether;

        if (totalValueInEther < 1) {
            specialTraits[tokenId] = SpecialTrait({
                category: "lil pengo",
                networth: string.concat(totalValueInEther.toString(), " MON")
            });
        } else if (totalValueInEther < 2) {
            specialTraits[tokenId] = SpecialTrait({
                category: "pengo army",
                networth: string.concat(totalValueInEther.toString(), " MON")
            });
        } else if (totalValueInEther < 5) {
            specialTraits[tokenId] = SpecialTrait({
                category: "pengo millionaire",
                networth: string.concat(totalValueInEther.toString(), " MON")
            });
        } else if (totalValueInEther < 10) {
            specialTraits[tokenId] = SpecialTrait({
                category: "pengo billionaire",
                networth: string.concat(totalValueInEther.toString(), " MON")
            });
        } else {
            specialTraits[tokenId] = SpecialTrait({
                category: "fucking rich pengo",
                networth: string.concat(totalValueInEther.toString(), " MON")
            });
        }
    }

    /*---------------------------------------------------------------------
    *                        Seed factory function
    ---------------------------------------------------------------------*/
    function getSeed(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token ID does not exist.");
        return seeds[tokenId];
    }

    function _genSeed(uint256 _mintAmount) internal {
        uint256 nextTokenId = _nextTokenId();
        for (uint256 i = 0; i < _mintAmount; i++) {
            seeds[nextTokenId] = random(nextTokenId);
            ++nextTokenId;
        }
    }

    function random(
        uint256 tokenId
    ) private view returns (uint256 pseudoRandomness) {
        pseudoRandomness = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    blockhash(block.number - 1),
                    msg.sender,
                    tokenId,
                    gasleft()
                )
            )
        );
        return pseudoRandomness;
    }

    function getNFTDetails(
        uint256 tokenId
    ) public view returns (Accessory[] memory, SpecialTrait memory) {
        uint256 count = accessoryIds[tokenId].length;
        Accessory[] memory tempAccessories = new Accessory[](count);

        for (uint256 i = 0; i < count; i++) {
            tempAccessories[i] = accessories[tokenId][accessoryIds[tokenId][i]];
        }

        return (tempAccessories, specialTraits[tokenId]);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721A, IERC721A) returns (string memory) {
        require(_exists(tokenId), "Token ID does not exist.");
        uint256 seed = seeds[tokenId];
        return factory.tokenURI(tokenId, seed);
    }

    function setRoyaltyAddress(address _royaltyAddress) public onlyOwner {
        ROYALTY_ADDRESS = _royaltyAddress;
    }

    function setBeneficiaryAddress(
        address _beneficiaryAddress
    ) public onlyOwner {
        BENEFICARY_ADDRESS = _beneficiaryAddress;
    }

    function setFactory(IPengoFactory _factoryAddress) external onlyOwner {
        factory = _factoryAddress;
    }

    function withdraw() public onlyOwner {
        uint256 totalOfferFunds = totalOfferBalance; 
        uint256 withdrawableAmount = address(this).balance - totalOfferFunds;

        require(withdrawableAmount > 0, "No funds available for withdrawal");

        (bool success, ) = payable(BENEFICARY_ADDRESS).call{
            value: withdrawableAmount
        }("");
        require(success, "Withdraw failed");
    }

    
}
