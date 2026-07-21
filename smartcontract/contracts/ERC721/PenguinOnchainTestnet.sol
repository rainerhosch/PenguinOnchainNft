// SPDX-License-Identifier: MIT
/*
 * ** author  : Onchain Pengo Lab
 * ** package : @contracts/ERC721/PenguinOnchain.sol
 * Security + gas-optimized (ABI surface preserved for dapp)
 */
pragma solidity ^0.8.20;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "../interfaces/IPengoFactory.sol";
import "../interfaces/IPenguinOnchain.sol";
import "../libraries/pengoConverter.sol";

contract PenguinOnchainTestnet is
    ERC721AQueryable,
    Ownable,
    ReentrancyGuard,
    IPenguinOnchain,
    IERC165
{
    using Strings for uint256;

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error SoldOut();
    error InsufficientPayment();
    error MaxMintPerWalletReached();
    error ZeroMintAmount();
    error NotTokenOwner();
    error NotAccessoryOwner();
    error TokenDoesNotExist();
    error PartNotAllowed();
    error InvalidPixelData();
    error SlotFilled();
    error AlreadyListed();
    error NotForSale();
    error ZeroPrice();
    error OwnerCannotOffer();
    error OfferTooLow();
    error NoActiveOffer();
    error NotYourOffer();
    error TransferFailed();
    error NoWithdrawableFunds();
    error InvalidBeneficiary();
    error InvalidRecipient();
    error ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/
    uint256 public constant MAX_SUPPLY = 50000;
    uint256 public constant MINT_PRICE = 0.05 ether;
    uint256 public constant MAX_MINT_PER_WALLET = 500;
    uint256 public constant ROYALTY_PERCENT = 5;

    IPengoFactory public factory;
    address public BENEFICARY_ADDRESS;
    address public ROYALTY_ADDRESS;

    uint256 public nextAccessoryId = 1;
    mapping(uint256 => uint256) internal seeds;
    mapping(address => uint256) public mintedCount;
    mapping(uint256 => SpecialTrait) public specialTraits;
    mapping(uint256 => mapping(uint256 => Accessory)) public accessories;
    mapping(uint256 => uint256[]) public accessoryIds;
    mapping(uint256 => mapping(string => bool)) private accessoryOfTokenExists;

    uint256 public totalOfferBalance;
    mapping(uint256 => mapping(uint256 => Offer)) public offers;
    mapping(address => uint256) public offerBalances;
    AccessoryForSale[] public accessoriesForSale;

    // --- Share Power & $PENGO Token ---
    mapping(uint256 => uint256) public sharePower;
    uint256 public totalSharePower;
    address public pengoToken;

    event AccessoryAdded(
        uint256 indexed tokenId,
        string trait_type,
        uint256 accessoryId
    );
    event AccessoryListed(uint256 indexed accessoryId, uint256 price);
    event AccessoryDeleted(
        uint256 indexed accessoryId,
        uint256 indexed fromTokenId
    );
    event AccessorySold(
        string accessoryType,
        uint256 indexed accessoryId,
        uint256 indexed fromTokenId,
        uint256 indexed toTokenId,
        address seller,
        address buyer,
        uint256 price
    );
    event AccessorySaleCancelled(
        uint256 indexed accessoryId,
        address accessoryOwner
    );
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
    event MetadataUpdate(uint256 _tokenId);

    constructor() ERC721A("Pengo Testnet Snapshoot", "Pengo") {
        address deployer = msg.sender;
        BENEFICARY_ADDRESS = deployer;
        ROYALTY_ADDRESS = deployer;
    }

    /*//////////////////////////////////////////////////////////////
                                  MINT
    //////////////////////////////////////////////////////////////*/
    function mintPengo(
        uint256 _mintAmount
    ) public payable nonReentrant returns (uint256[] memory) {
        if (_mintAmount == 0) revert ZeroMintAmount();
        uint256 supply = totalSupply();
        if (supply + _mintAmount > MAX_SUPPLY) revert SoldOut();
        if (msg.value < _mintAmount * MINT_PRICE) revert InsufficientPayment();

        uint256 minted = mintedCount[msg.sender];
        if (minted + _mintAmount > MAX_MINT_PER_WALLET)
            revert MaxMintPerWalletReached();

        // Capture IDs before ERC721A advances counter
        uint256 startTokenId = _nextTokenId();
        _genSeed(_mintAmount);
        _safeMint(msg.sender, _mintAmount);

        unchecked {
            mintedCount[msg.sender] = minted + _mintAmount;
        }

        // New mints have no accessories — skip full updateTraits loop (gas)
        uint256[] memory newTokenIds = new uint256[](_mintAmount);
        for (uint256 i; i < _mintAmount; ) {
            uint256 tokenId = startTokenId + i;
            newTokenIds[i] = tokenId;
            // Default trait slot without iterating accessories
            specialTraits[tokenId] = SpecialTrait({
                category: "lil pengo",
                networth: "0 MON"
            });
            emit MetadataUpdate(tokenId);
            unchecked {
                ++i;
            }
        }

        // Pay only mint proceeds — never drain offer escrow (security)
        address beneficiary = BENEFICARY_ADDRESS;
        if (beneficiary == address(0)) revert InvalidBeneficiary();
        uint256 proceeds = _mintAmount * MINT_PRICE;
        // Refund dust overpayment to minter; send proceeds to beneficiary
        unchecked {
            uint256 excess = msg.value - proceeds;
            if (excess > 0) {
                (bool refundOk, ) = payable(msg.sender).call{value: excess}("");
                if (!refundOk) revert TransferFailed();
            }
        }
        (bool payOk, ) = payable(beneficiary).call{value: proceeds}("");
        if (!payOk) revert TransferFailed();

        return newTokenIds;
    }

    /*//////////////////////////////////////////////////////////////
                              ACCESSORIES
    //////////////////////////////////////////////////////////////*/
    function addAccessory(
        uint256 tokenId,
        string calldata trait_type,
        string calldata trait_name,
        string calldata byteCode
    ) public {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (!factory.isAllowedPart(trait_type)) revert PartNotAllowed();
        if (accessoryOfTokenExists[tokenId][trait_type]) revert SlotFilled();

        bytes memory data = PengoConverter.hexStringToBytes(byteCode);
        if (data.length == 0 || data.length % 7 != 0) revert InvalidPixelData();

        uint256 numPixels = data.length / 7;
        uint256 validCount;
        for (uint256 i; i < numPixels; ) {
            uint256 offset = i * 7;
            if (
                factory.isValidCoordinate(
                    trait_type,
                    uint8(data[offset]),
                    uint8(data[offset + 1])
                )
            ) {
                unchecked {
                    ++validCount;
                }
            }
            unchecked {
                ++i;
            }
        }
        if (validCount == 0) revert InvalidPixelData();

        uint256[] memory pixels = new uint256[](validCount * 4);
        string[] memory colors = new string[](validCount);
        uint256 counter;
        for (uint256 i; i < numPixels; ) {
            uint256 offset = i * 7;
            uint8 x = uint8(data[offset]);
            uint8 y = uint8(data[offset + 1]);
            if (factory.isValidCoordinate(trait_type, x, y)) {
                uint256 base = counter * 4;
                pixels[base] = x;
                pixels[base + 1] = y;
                pixels[base + 2] = uint8(data[offset + 2]);
                pixels[base + 3] = uint8(data[offset + 3]);
                // colors stored as 3 raw hex chars via encodePacked of bytes
                colors[counter] = string(
                    abi.encodePacked(
                        data[offset + 4],
                        data[offset + 5],
                        data[offset + 6]
                    )
                );
                unchecked {
                    ++counter;
                }
            }
            unchecked {
                ++i;
            }
        }

        string memory validByte = factory.reconstructHexString(pixels, colors);

        uint256 accessoryId = nextAccessoryId;
        unchecked {
            nextAccessoryId = accessoryId + 1;
        }

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
        accessoryOfTokenExists[tokenId][trait_type] = true;

        updateTraits(tokenId);
        emit AccessoryAdded(tokenId, trait_type, accessoryId);
    }

    function listAccessoryForSale(
        uint256 tokenId,
        uint256 accessoryId,
        uint256 price
    ) public {
        Accessory storage acc = accessories[tokenId][accessoryId];
        if (acc.owner != msg.sender) revert NotAccessoryOwner();
        if (acc.forSale) revert AlreadyListed();
        if (price == 0) revert ZeroPrice();

        acc.sellingPrice = price;
        acc.forSale = true;

        accessoriesForSale.push(
            AccessoryForSale({
                tokenId: tokenId,
                accessoryId: accessoryId,
                accessory: acc
            })
        );

        emit AccessoryListed(accessoryId, price);
    }

    function removeAccesory(uint256 tokenId, uint256 accessoryId) public {
        Accessory storage acc = accessories[tokenId][accessoryId];
        if (acc.owner != msg.sender) revert NotAccessoryOwner();

        // Cache before storage delete
        string memory traitType = acc.trait_type;
        _saveRemoveAccessory(tokenId, accessoryId);
        accessoryOfTokenExists[tokenId][traitType] = false;
        updateTraits(tokenId);
    }

    function _saveRemoveAccessory(
        uint256 fromTokenId,
        uint256 accessoryId
    ) private {
        if (accessories[fromTokenId][accessoryId].forSale) {
            removeAccessoryFromSale(fromTokenId, accessoryId);
        }

        delete accessories[fromTokenId][accessoryId];

        uint256[] storage ids = accessoryIds[fromTokenId];
        uint256 length = ids.length;
        for (uint256 i; i < length; ) {
            if (ids[i] == accessoryId) {
                ids[i] = ids[length - 1];
                ids.pop();
                break;
            }
            unchecked {
                ++i;
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
        // Buyer must own destination NFT
        if (ownerOf(toTokenId) != msg.sender) revert NotTokenOwner();

        Accessory storage fromAcc = accessories[fromTokenId][accessoryId];
        if (!fromAcc.forSale) revert NotForSale();

        uint256 price = fromAcc.sellingPrice;
        if (price == 0) revert ZeroPrice();
        if (msg.value < price) revert InsufficientPayment();

        string memory accessoryType = fromAcc.trait_type;
        if (accessoryOfTokenExists[toTokenId][accessoryType])
            revert SlotFilled();

        address previousOwner = fromAcc.owner;
        string memory traitName = fromAcc.trait_name;
        string memory bytePixel = fromAcc.bytePixel;

        uint256 royalty = (price * ROYALTY_PERCENT) / 100;
        uint256 sellerAmount = price - royalty;
        address royaltyTo = ROYALTY_ADDRESS == address(0)
            ? owner()
            : ROYALTY_ADDRESS;

        // Effects first
        accessories[toTokenId][accessoryId] = Accessory({
            accessoryId: accessoryId,
            trait_type: accessoryType,
            trait_name: traitName,
            bytePixel: bytePixel,
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

        // Interactions
        (bool successSeller, ) = payable(previousOwner).call{
            value: sellerAmount
        }("");
        if (!successSeller) revert TransferFailed();

        if (royalty > 0) {
            (bool successRoyalty, ) = payable(royaltyTo).call{value: royalty}(
                ""
            );
            if (!successRoyalty) revert TransferFailed();
        }

        // Refund overpayment
        unchecked {
            uint256 excess = msg.value - price;
            if (excess > 0) {
                (bool refundOk, ) = payable(msg.sender).call{value: excess}("");
                if (!refundOk) revert TransferFailed();
            }
        }

        emit AccessorySold(
            accessoryType,
            accessoryId,
            fromTokenId,
            toTokenId,
            previousOwner,
            msg.sender,
            price
        );
    }

    function removeAccessoryFromSale(
        uint256 fromTokenId,
        uint256 accessoryId
    ) private {
        uint256 index = findAccessoryIndex(fromTokenId, accessoryId);
        if (index >= accessoriesForSale.length) revert NotForSale();

        accessories[fromTokenId][accessoryId].forSale = false;
        accessories[fromTokenId][accessoryId].sellingPrice = 0;

        uint256 lastIndex = accessoriesForSale.length - 1;
        if (index != lastIndex) {
            accessoriesForSale[index] = accessoriesForSale[lastIndex];
        }
        accessoriesForSale.pop();
    }

    function findAccessoryIndex(
        uint256 tokenId,
        uint256 accessoryId
    ) public view returns (uint256) {
        uint256 len = accessoriesForSale.length;
        for (uint256 i; i < len; ) {
            if (
                accessoriesForSale[i].tokenId == tokenId &&
                accessoriesForSale[i].accessoryId == accessoryId
            ) {
                return i;
            }
            unchecked {
                ++i;
            }
        }
        return len;
    }

    /*//////////////////////////////////////////////////////////////
                                 OFFERS
    //////////////////////////////////////////////////////////////*/
    function makeOffer(
        uint256 accessoryId,
        uint256 fromTokenId,
        uint256 toTokenId
    ) public payable nonReentrant {
        if (msg.value == 0) revert ZeroPrice();
        if (ownerOf(toTokenId) != msg.sender) revert NotTokenOwner();

        Accessory storage acc = accessories[fromTokenId][accessoryId];
        if (acc.owner == msg.sender) revert OwnerCannotOffer();
        if (accessoryOfTokenExists[toTokenId][acc.trait_type])
            revert SlotFilled();

        Offer storage currentOffer = offers[fromTokenId][accessoryId];
        if (currentOffer.active && msg.value <= currentOffer.price)
            revert OfferTooLow();

        // Refund previous offerer (accounting first)
        if (currentOffer.active) {
            address prevBuyer = currentOffer.buyer;
            uint256 prevPrice = currentOffer.price;
            offerBalances[prevBuyer] -= prevPrice;
            totalOfferBalance -= prevPrice;
            (bool success, ) = payable(prevBuyer).call{value: prevPrice}("");
            if (!success) revert TransferFailed();
        }

        offers[fromTokenId][accessoryId] = Offer({
            buyer: msg.sender,
            toTokenId: toTokenId,
            price: msg.value,
            active: true
        });
        offerBalances[msg.sender] += msg.value;
        totalOfferBalance += msg.value;

        emit AccessoryOfferMade(
            accessoryId,
            fromTokenId,
            toTokenId,
            msg.sender,
            msg.value
        );
    }

    function cancelOffer(
        uint256 accessoryId,
        uint256 fromTokenId
    ) public nonReentrant {
        Offer storage currentOffer = offers[fromTokenId][accessoryId];
        if (!currentOffer.active) revert NoActiveOffer();
        if (currentOffer.buyer != msg.sender) revert NotYourOffer();

        uint256 refundAmount = currentOffer.price;
        uint256 toTokenId = currentOffer.toTokenId;

        delete offers[fromTokenId][accessoryId];
        offerBalances[msg.sender] -= refundAmount;
        totalOfferBalance -= refundAmount;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) revert TransferFailed();

        emit AccessoryOfferCancelled(
            accessoryId,
            fromTokenId,
            toTokenId,
            msg.sender,
            refundAmount
        );
    }

    function approveOffer(
        uint256 fromTokenId,
        uint256 accessoryId
    ) public nonReentrant {
        Offer memory offer = offers[fromTokenId][accessoryId];
        if (!offer.active) revert NoActiveOffer();

        Accessory storage acc = accessories[fromTokenId][accessoryId];
        if (acc.owner != msg.sender) revert NotAccessoryOwner();

        uint256 amount = offer.price;
        uint256 toTokenId = offer.toTokenId;
        address buyer = offer.buyer;
        string memory traitType = acc.trait_type;
        string memory traitName = acc.trait_name;
        string memory bytePixel = acc.bytePixel;

        if (ownerOf(toTokenId) != buyer) revert NotTokenOwner();
        if (accessoryOfTokenExists[toTokenId][traitType]) revert SlotFilled();

        // Clear offer accounting before external call
        delete offers[fromTokenId][accessoryId];
        offerBalances[buyer] -= amount;
        totalOfferBalance -= amount;

        accessories[toTokenId][accessoryId] = Accessory({
            accessoryId: accessoryId,
            trait_type: traitType,
            trait_name: traitName,
            bytePixel: bytePixel,
            sellingPrice: 0,
            lastPrice: amount,
            owner: buyer,
            forSale: false
        });
        accessoryIds[toTokenId].push(accessoryId);
        accessoryOfTokenExists[toTokenId][traitType] = true;
        accessoryOfTokenExists[fromTokenId][traitType] = false;

        _saveRemoveAccessory(fromTokenId, accessoryId);
        updateTraits(toTokenId);
        updateTraits(fromTokenId);

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit AccessorySold(
            traitType,
            accessoryId,
            fromTokenId,
            toTokenId,
            msg.sender,
            buyer,
            amount
        );
    }

    function updateTraits(uint256 tokenId) internal {
        uint256 totalValue;
        uint256[] storage ids = accessoryIds[tokenId];
        uint256 len = ids.length;
        for (uint256 i; i < len; ) {
            totalValue += accessories[tokenId][ids[i]].lastPrice;
            unchecked {
                ++i;
            }
        }

        uint256 totalValueInEther = totalValue / 1 ether;
        string memory cat;
        if (totalValueInEther < 1) {
            cat = "lil pengo";
        } else if (totalValueInEther < 2) {
            cat = "pengo army";
        } else if (totalValueInEther < 5) {
            cat = "pengo millionaire";
        } else if (totalValueInEther < 10) {
            cat = "pengo billionaire";
        } else {
            cat = "fucking rich pengo";
        }

        specialTraits[tokenId] = SpecialTrait({
            category: cat,
            networth: string.concat(totalValueInEther.toString(), " MON")
        });
        emit MetadataUpdate(tokenId);
    }

    /*//////////////////////////////////////////////////////////////
                                  VIEWS
    //////////////////////////////////////////////////////////////*/
    function getSeed(uint256 tokenId) public view returns (uint256) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return seeds[tokenId];
    }

    function _genSeed(uint256 _mintAmount) internal {
        uint256 nextTokenId = _nextTokenId();
        for (uint256 i; i < _mintAmount; ) {
            seeds[nextTokenId] = _pseudoRandom(nextTokenId);
            unchecked {
                ++nextTokenId;
                ++i;
            }
        }
    }

    /// @dev Not VRF — cosmetic traits only. Documented for security review.
    function _pseudoRandom(uint256 tokenId) private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.prevrandao,
                        block.timestamp,
                        msg.sender,
                        tokenId,
                        address(this)
                    )
                )
            );
    }

    function getNFTDetails(
        uint256 tokenId
    ) public view returns (Accessory[] memory, SpecialTrait memory) {
        uint256 count = accessoryIds[tokenId].length;
        Accessory[] memory tempAccessories = new Accessory[](count);
        for (uint256 i; i < count; ) {
            tempAccessories[i] = accessories[tokenId][accessoryIds[tokenId][i]];
            unchecked {
                ++i;
            }
        }
        return (tempAccessories, specialTraits[tokenId]);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721A, IERC721A) returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return factory.tokenURI(tokenId, seeds[tokenId]);
    }

    function contractURI() public view virtual returns (string memory) {
        return factory._createContractURI();
    }

    /*//////////////////////////////////////////////////////////////
                                 ADMIN
    //////////////////////////////////////////////////////////////*/
    function setRoyaltyAddress(address _royaltyAddress) public onlyOwner {
        if (_royaltyAddress == address(0)) revert ZeroAddress();
        ROYALTY_ADDRESS = _royaltyAddress;
    }

    function setBeneficiaryAddress(
        address _beneficiaryAddress
    ) public onlyOwner {
        if (_beneficiaryAddress == address(0)) revert ZeroAddress();
        BENEFICARY_ADDRESS = _beneficiaryAddress;
    }

    function setFactory(IPengoFactory _factoryAddress) external onlyOwner {
        if (address(_factoryAddress) == address(0)) revert ZeroAddress();
        factory = _factoryAddress;
    }

    function setPengoToken(address _pengoToken) external onlyOwner {
        pengoToken = _pengoToken;
    }

    function addSharePower(uint256 tokenId, uint256 amount) external {
        if (msg.sender != pengoToken) revert("Only PengoToken can add power");
        if (!_exists(tokenId)) revert TokenDoesNotExist();

        sharePower[tokenId] += amount;
        totalSharePower += amount;
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);

        // Only trigger on transfers (not mints or burns)
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < quantity; i++) {
                uint256 tokenId = startTokenId + i;

                // Deduct from total
                totalSharePower -= sharePower[tokenId];
                // Reset power
                sharePower[tokenId] = 0;

                // Reset networth
                specialTraits[tokenId].networth = "0";
            }
        }
    }

    function withdraw() public onlyOwner {
        uint256 withdrawableAmount = address(this).balance - totalOfferBalance;
        if (withdrawableAmount == 0) revert NoWithdrawableFunds();

        address beneficiary = BENEFICARY_ADDRESS;
        if (beneficiary == address(0)) revert InvalidBeneficiary();

        (bool success, ) = payable(beneficiary).call{value: withdrawableAmount}(
            ""
        );
        if (!success) revert TransferFailed();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC721A, IERC721A) returns (bool) {
        // EIP-4906 MetadataUpdate
        return
            interfaceId == bytes4(0x49064906) ||
            super.supportsInterface(interfaceId);
    }
}
