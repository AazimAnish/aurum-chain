// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GoldToken
 * @dev ERC20 token representing tokenized gold
 */
contract GoldToken is ERC20, Ownable {
    // Mapping from user address to their gold holdings
    mapping(address => uint256) private _goldHoldings;
    
    // Address of the GoldLedger contract that is authorized to mint tokens
    address public goldLedgerContract;
    
    // Conversion rate: 1 gram of gold = 1 token (can be adjusted as needed)
    uint256 public constant GOLD_TO_TOKEN_RATE = 1;
    
    constructor() ERC20("Gold Token", "GOLD") Ownable(msg.sender) {}
    
    /**
     * @dev Set the address of the GoldLedger contract
     * @param _goldLedgerAddress The address of the GoldLedger contract
     */
    function setGoldLedgerContract(address _goldLedgerAddress) external onlyOwner {
        goldLedgerContract = _goldLedgerAddress;
    }
    
    /**
     * @dev Mint tokens based on gold weight
     * @param to The address that will receive the minted tokens
     * @param goldWeight The amount of gold in grams
     */
    function mintGoldTokens(address to, uint256 goldWeight) external {
        // Allow only owner or GoldLedger contract to mint tokens
        require(msg.sender == owner() || msg.sender == goldLedgerContract, 
                "Only owner or GoldLedger can mint tokens");
        
        require(goldWeight > 0, "Gold weight must be greater than zero");
        
        uint256 tokenAmount = goldWeight * GOLD_TO_TOKEN_RATE;
        _mint(to, tokenAmount);
        
        // Update gold holdings
        _goldHoldings[to] += goldWeight;
    }
    
    /**
     * @dev Burn tokens when gold is removed
     * @param from The address from which to burn tokens
     * @param goldWeight The amount of gold in grams being removed
     */
    function burnGoldTokens(address from, uint256 goldWeight) external onlyOwner {
        require(goldWeight > 0, "Gold weight must be greater than zero");
        require(_goldHoldings[from] >= goldWeight, "Not enough gold holdings");
        
        uint256 tokenAmount = goldWeight * GOLD_TO_TOKEN_RATE;
        require(balanceOf(from) >= tokenAmount, "Not enough tokens to burn");
        
        _burn(from, tokenAmount);
        
        // Update gold holdings
        _goldHoldings[from] -= goldWeight;
    }
    
    /**
     * @dev Get gold holdings for an address
     * @param account The address to check
     * @return The amount of gold holdings in grams
     */
    function getGoldHoldings(address account) external view returns (uint256) {
        return _goldHoldings[account];
    }

    // Get total gold holdings (in grams) for an address
    function getTotalGoldHoldings(address _owner) external view returns (uint256) {
        return _goldHoldings[_owner];
    }
} 