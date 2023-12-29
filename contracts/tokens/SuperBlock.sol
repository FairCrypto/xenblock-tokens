// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../abstracts/VoterToken.sol";

/// @author The Faircrypto Team
/// @title The Superblock Token
contract SuperBlock is VoterToken {
    uint8 public constant CAPITAL_LETTERS = 50;

    function initialize(
        address initialOwner,
        address initialVoteManager,
        address initialTokenRegistry
    ) public initializer {
        __ERC20_init("SuperBlock", "XBLK");
        __ERC20Burnable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("SuperBlock");
        voteManagerAddress = initialVoteManager;
        tokenRegistryAddress = initialTokenRegistry;
        amountPerHash = 10000000000000000000;
        pattern = "XEN11";
    }

    /**
     * Validates `hash`
     * @dev Validates the argon2 hash by checking if it contains the string from the state variable `pattern` and at least 50 capital letters.
     * @param hash the argon2hash string to validate
     * @return status Returns true if the hash is valid, false otherwise
     * @return version Returns the version of the token.
     **/
    function validateArgon2Hash(
        string calldata hash,
        uint256 /*minedTimestamp*/
    ) public view override returns (bool, uint16) {
        bool status = _strContains(hash, pattern) &&
            _containsCapitalChars(hash);
        return (status, version);
    }

    function _containsCapitalChars(
        string calldata hash
    ) internal pure returns (bool) {
        bytes memory bytesInput = bytes(hash);
        uint8 capitalCount = 0;

        for (uint i = 0; i < bytesInput.length; i++) {
            if (_isCapital(bytesInput[i])) {
                capitalCount++;
            }

            if (capitalCount >= CAPITAL_LETTERS) {
                return true;
            }
        }

        return false;
    }

    function _isCapital(bytes1 char) internal pure returns (bool) {
        return (char >= bytes1("A") && char <= bytes1("Z"));
    }
}
