//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GoldLedger {
    struct GoldDetails {
        bytes12 uniqueIdentifier; // changes from bytes32 to bytes12
        string weight;
        string purity;
        string description;
        string certificationDetails;
        string certificationDate;
        string mineLocation;
        bytes12 parentGoldId; // Changed from bytes32 to bytes12
        bool hasParentGoldId; // New field to indicate if parentGoldId is set
    }

    mapping(bytes12 => GoldDetails) private goldRegistry; // Changed from bytes32 to bytes12
    bytes12[] private goldIdentifiers; // Changed from bytes32 to bytes12
    uint256 public totalRegistrations;

    event GoldRegistered(bytes12 indexed uniqueIdentifier, address indexed registrar); // Changed from bytes32 to bytes12

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
        
        goldRegistry[uniqueIdentifier] = GoldDetails({
            uniqueIdentifier: uniqueIdentifier,
            weight: _weight,
            purity: _purity,
            description: _description,
            certificationDetails: _certificationDetails,
            certificationDate: _certificationDate,
            mineLocation: _mineLocation,
            parentGoldId: _parentGoldId, // Changed from bytes32 to bytes12
            hasParentGoldId: _parentGoldId != bytes12(0) // Check if parentGoldId is set
        });
        goldIdentifiers.push(uniqueIdentifier);

        emit GoldRegistered(uniqueIdentifier, msg.sender);

        return uniqueIdentifier;
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
}
