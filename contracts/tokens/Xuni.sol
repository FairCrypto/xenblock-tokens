// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../abstracts/VoterToken.sol";
import "hardhat/console.sol";

/// @author The Faircrypto Team
/// @title The Xuni Token
contract Xuni is VoterToken {
    bool public enforceTimestampCheck;

    function initialize(
        address initialOwner,
        address initialVoteManager,
        address initialTokenRegistry
    ) public initializer {
        __ERC20_init("Xuni", "XUNI");
        __ERC20Burnable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("Xuni");
        voteManagerAddress = initialVoteManager;
        tokenRegistryAddress = initialTokenRegistry;
        enforceTimestampCheck = false;
        amountPerHash = 1000000000000000000; // 1
        pattern = "XUNI";
    }

    /**
     * @dev Updates the enforceTimestampCheck state variable to be able to enable/disable the timestamp checks.
     * We will enable this check once we switch away from xenblocks.io.
     * @param enforceTimestampCheck_ the new value for the state variable
     */
    function updateEnforceTimestampCheck(
        bool enforceTimestampCheck_
    ) public onlyOwner {
        enforceTimestampCheck = enforceTimestampCheck_;
    }

    /**
     * Validates `hash`
     * @dev Validates the argon2 hash by checking if it contains a pattern from the state variable `patterns`
     * and if the block timestamp is within 5 minutes of the hour.
     * @param hash the argon2hash string to validate
     * @param minedTimestamp the timestamp of the block the hash was mined in. It can be used for additional validation.
     * @return status Returns true if the hash is valid, false otherwise
     * @return version Returns the version of the token.
     **/
    function validateArgon2Hash(
        string calldata hash,
        uint256 minedTimestamp
    ) public view override returns (bool, uint16) {
        bool status = _strContainsWithNumberSuffix(hash, pattern) &&
            _isWithin5Minutes(minedTimestamp);

        return (status, version);
    }

    function _strContainsWithNumberSuffix(
        string calldata mainString,
        string memory subString
    ) internal pure returns (bool) {
        bytes memory mainBytes = bytes(mainString);
        bytes memory subBytes = bytes(subString);

        if (mainBytes.length < subBytes.length) {
            return false;
        }

        for (uint i = 0; i <= mainBytes.length - subBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < subBytes.length + 1; j++) {
                // check for a number suffix. any integer from 0-9
                // this check is specific to xuni.
                if (j == subBytes.length) {
                    if (
                        mainBytes[i + j] >= bytes1("0") &&
                        mainBytes[i + j] <= bytes1("9")
                    ) {
                        continue;
                    } else {
                        found = false;
                        break;
                    }
                } else if (mainBytes[i + j] != subBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }

        return false;
    }

    function _isWithin5Minutes(
        uint256 minedTimestamp
    ) internal view returns (bool) {
        if (!enforceTimestampCheck) {
            return true;
        }

        uint256 remainder = minedTimestamp % 3600; // seconds in an hour
        return remainder <= 300 || remainder >= 3300;
    }
}
