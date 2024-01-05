// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @author The Faircrypto Team
/// @dev The VoterToken abstract contract which all voter tokens must inherit from.
abstract contract VoterToken is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    OwnableUpgradeable,
    ERC20PermitUpgradeable
{
    /// @dev The version of the token. This increments every time the token is upgraded or modified.
    uint16 public version;

    /// @dev The address of the vote manager contract.
    address public voteManagerAddress;

    /// @dev The address of the token registry contract.
    address public tokenRegistryAddress;

    /// @dev The amount of tokens (WEI) minted per hash.
    uint256 public amountPerHash;

    /// @dev The pattern used to validate the argon2 hash.
    string public pattern;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    modifier onlyVoteManager() {
        require(
            msg.sender == voteManagerAddress,
            "Only vote manager can call this function."
        );
        _;
    }

    modifier onlyTokenRegistryOrOwner() {
        require(
            msg.sender == tokenRegistryAddress || owner() == _msgSender(),
            "Only the token registry or owner can call this function."
        );
        _;
    }

    function _incrementVersion() internal {
        version++;
    }

    /**
     * @dev increments the token's version number.
     * This should be call after every upgrade or modification to the token.
     * This will prevent the race condition where the validateArgon2Hash
     * function may return different results for the same hash between upgrades.
     */
    function incrementVersion() external onlyTokenRegistryOrOwner {
        _incrementVersion();
    }

    /**
     * @dev Updates the token registry address. May only be called by the owner.
     * @param tokenRegistryAddress_ the new token registry address
     */
    function updateTokenRegistryAddress(
        address tokenRegistryAddress_
    ) external onlyOwner {
        tokenRegistryAddress = tokenRegistryAddress_;
        _incrementVersion();
    }

    /**
     * @dev Updates the vote manager address. May only be called by the token registry or owner.
     * @param voteManagerAddress_ the new vote manager address
     */
    function updateVoterManagerAddress(
        address voteManagerAddress_
    ) external onlyTokenRegistryOrOwner {
        voteManagerAddress = voteManagerAddress_;
        _incrementVersion();
    }

    /**
     * @dev Updates the amount of tokens (WEI) minted per hash.
     * @param amountPerHash_ the new amount of tokens minted per hash
     */
    function updateAmountPerHash(uint256 amountPerHash_) external onlyOwner {
        require(amountPerHash_ > 0, "Amount per hash must be greater than 0.");
        amountPerHash = amountPerHash_;
        _incrementVersion();
    }

    /**
     * @dev Updates the pattern used to validate the argon2 hash.
     * @param pattern_ the new pattern to use
     */
    function updatePattern(string memory pattern_) external onlyOwner {
        require(
            bytes(pattern_).length > 2 && bytes(pattern_).length <= 100,
            "Pattern must be between 3 and 100 characters."
        );
        pattern = pattern_;
        _incrementVersion();
    }

    /**
     * @dev Mints tokens to the specified address. May only be called by the vote manager.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyVoteManager {
        _mint(to, amount);
    }

    /**
     * @dev Validates the argon2 hash by checking if it contains the patten from the state variable `pattern`.
     * @param hash the argon2 hash string to validate. Only include the hash, not the salt or any other data.
     * @return status Returns true if the hash is valid, false otherwise
     * @return version Returns the version of the token.
     **/
    function validateArgon2Hash(
        string calldata hash,
        uint256 /*minedTimestamp*/
    ) public view virtual returns (bool, uint16) {
        return (_strContains(hash, pattern), version);
    }

    /**
     * Returns true if the string contains the substring.
     */
    function _strContains(
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
            for (uint j = 0; j < subBytes.length; j++) {
                if (mainBytes[i + j] != subBytes[j]) {
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
}
