// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./abstracts/VoterToken.sol";

contract TokenRegistry is Initializable, OwnableUpgradeable {
    struct Token {
        address addr;
        string name;
        string symbol;
        uint256 amountPerHash;
    }

    uint256 public tokenIdCounter;
    mapping(uint256 => Token) public tokensById;
    mapping(string => uint256) public tokenIdBySymbol;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    function registerToken(
        string memory name,
        string memory symbol,
        uint256 initialAmountPerHash,
        address addr
    ) external onlyOwner {
        tokenIdCounter++;

        tokensById[tokenIdCounter] = Token({
            addr: addr,
            symbol: symbol,
            name: name,
            amountPerHash: initialAmountPerHash
        });

        tokenIdBySymbol[symbol] = tokenIdCounter;
    }

    function updateVoteManagerAddress(address voteManagerAddr) external onlyOwner {
        for(uint256 i = 0; i < tokenIdCounter; i++) {
            VoterToken vt = VoterToken(tokensById[i].addr);
            vt.updateVoterManagerAddress(voteManagerAddr);
        }
    }

    function getToken(uint256 _id) public view returns (Token memory) {
        return tokensById[_id];
    }
}
