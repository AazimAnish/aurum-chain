//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GoldToken.sol";

contract GoldLedger {
    // Struct for tracking ownership history records
    struct OwnershipRecord {
        address owner;
        uint256 timestamp; // Unix timestamp of ownership transfer
        string date;       // Human-readable date string
    }

    struct GoldDetails {
        bytes12 uniqueIdentifier; // changes from bytes32 to bytes12
        string weight;
        uint256 weightInGrams; // Added for tokenization
        string purity;
        string description;
        string certificationDetails;
        string certificationDate;
        string mineLocation;
        bytes12 parentGoldId; // Changed from bytes32 to bytes12
        bool hasParentGoldId; // New field to indicate if parentGoldId is set
        address owner; // Current owner
        OwnershipRecord[] ownershipHistory; // Array to track all historical owners
    }

    // Reference to the GoldToken contract
    GoldToken public goldToken;

    // Mapping from address to array of gold IDs owned by that address
    mapping(address => bytes12[]) private ownerToGoldIds;
    
    mapping(bytes12 => GoldDetails) private goldRegistry; // Changed from bytes32 to bytes12
    bytes12[] private goldIdentifiers; // Changed from bytes32 to bytes12
    uint256 public totalRegistrations;

    event GoldRegistered(bytes12 indexed uniqueIdentifier, address indexed registrar); // Changed from bytes32 to bytes12
    event OwnershipTransferred(bytes12 indexed uniqueIdentifier, address indexed previousOwner, address indexed newOwner, string date);

    constructor(address _goldTokenAddress) {
        goldToken = GoldToken(_goldTokenAddress);
    }

    function registerGold(
        string calldata _weight,
        string calldata _purity,
        string calldata _description,
        string calldata _certificationDetails,
        string calldata _certificationDate,
        string calldata _mineLocation,
        bytes12 _parentGoldId // Changed from bytes32 to bytes12
    ) public returns (bytes12) { // Changed from bytes32 to bytes12
        require(bytes(_weight).length > 0, "Weight cannot be empty");
        require(bytes(_purity).length > 0, "Purity cannot be empty");

        bytes12 uniqueIdentifier = bytes12(keccak256(abi.encodePacked(block.timestamp, msg.sender, ++totalRegistrations))); // Changed from bytes32 to bytes12
        
        // Convert weight string to uint256 for tokenization
        uint256 weightInGrams = parseWeight(_weight);
        
        // Create a new GoldDetails record
        GoldDetails storage newGold = goldRegistry[uniqueIdentifier];
        newGold.uniqueIdentifier = uniqueIdentifier;
        newGold.weight = _weight;
        newGold.weightInGrams = weightInGrams;
        newGold.purity = _purity;
        newGold.description = _description;
        newGold.certificationDetails = _certificationDetails;
        newGold.certificationDate = _certificationDate;
        newGold.mineLocation = _mineLocation;
        newGold.parentGoldId = _parentGoldId;
        newGold.hasParentGoldId = _parentGoldId != bytes12(0);
        newGold.owner = msg.sender;
        
        // Initialize ownership history with the first owner (registrar)
        newGold.ownershipHistory.push(OwnershipRecord({
            owner: msg.sender,
            timestamp: block.timestamp,
            date: _certificationDate
        }));
        
        goldIdentifiers.push(uniqueIdentifier);
        
        // Add gold ID to owner's collection
        ownerToGoldIds[msg.sender].push(uniqueIdentifier);
        
        // Mint tokens based on gold weight
        goldToken.mintGoldTokens(msg.sender, weightInGrams);

        emit GoldRegistered(uniqueIdentifier, msg.sender);

        return uniqueIdentifier;
    }

    // Transfer ownership of a gold item to a new owner
    function transferOwnership(bytes12 _uniqueIdentifier, address _newOwner, string calldata _transferDate) public {
        require(_uniqueIdentifier != bytes12(0), "Invalid gold identifier");
        require(_newOwner != address(0), "Invalid new owner address");
        require(goldRegistry[_uniqueIdentifier].owner == msg.sender, "Only the current owner can transfer ownership");
        
        GoldDetails storage gold = goldRegistry[_uniqueIdentifier];
        address previousOwner = gold.owner;
        
        // Update the current owner
        gold.owner = _newOwner;
        
        // Add to ownership history
        gold.ownershipHistory.push(OwnershipRecord({
            owner: _newOwner,
            timestamp: block.timestamp,
            date: _transferDate
        }));
        
        // Update mappings
        // Remove from previous owner's collection
        removeGoldIdFromOwner(previousOwner, _uniqueIdentifier);
        
        // Add to new owner's collection
        ownerToGoldIds[_newOwner].push(_uniqueIdentifier);
        
        emit OwnershipTransferred(_uniqueIdentifier, previousOwner, _newOwner, _transferDate);
    }
    
    // Helper function to remove a gold ID from an owner's collection
    function removeGoldIdFromOwner(address _owner, bytes12 _goldId) private {
        bytes12[] storage ownedGold = ownerToGoldIds[_owner];
        for (uint256 i = 0; i < ownedGold.length; i++) {
            if (ownedGold[i] == _goldId) {
                // Swap with the last element and pop
                if (i < ownedGold.length - 1) {
                    ownedGold[i] = ownedGold[ownedGold.length - 1];
                }
                ownedGold.pop();
                break;
            }
        }
    }

    // Helper function to parse weight string to uint256
    function parseWeight(string memory _weight) internal pure returns (uint256) {
        // This is a simplified implementation
        // In a production environment, you would need a more robust parser
        // that handles different formats and units
        bytes memory weightBytes = bytes(_weight);
        uint256 result = 0;
        
        for (uint i = 0; i < weightBytes.length; i++) {
            // Only process digits
            if (uint8(weightBytes[i]) >= 48 && uint8(weightBytes[i]) <= 57) {
                result = result * 10 + (uint8(weightBytes[i]) - 48);
            }
        }
        
        return result;
    }

    function getGoldDetails(bytes12 _uniqueIdentifier) public view returns (GoldDetails memory) { // Changed from bytes32 to bytes12
        return goldRegistry[_uniqueIdentifier];
    }

    function getAllGoldDetails() external view returns (GoldDetails[] memory) {
        GoldDetails[] memory allGoldDetails = new GoldDetails[](goldIdentifiers.length);
        for (uint256 i = 0; i < goldIdentifiers.length; i++) {
            allGoldDetails[i] = goldRegistry[goldIdentifiers[i]];
        }
        return allGoldDetails;
    }
    
    // Get all gold IDs owned by an address
    function getGoldByOwner(address _owner) external view returns (bytes12[] memory) {
        return ownerToGoldIds[_owner];
    }
    
    // Get total gold holdings (in grams) for an address
    function getTotalGoldHoldings(address _owner) external view returns (uint256) {
        return goldToken.getGoldHoldings(_owner);
    }
}
