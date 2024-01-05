// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./abstracts/VoterToken.sol";

/// @author The Faircrypto Team
/// @dev The TokenRegistry contract. A registry of all voter tokens.
contract TokenRegistry is Initializable, OwnableUpgradeable {
    /// @dev The TokenConfig struct.
    /// @param currencyType The currency type of the token.
    /// @param token The VoterToken contract.
    /// @param exclusive When true, only this token will be used for validation. All others will be ignored when this token is matched.
    struct TokenConfig {
        uint256 currencyType;
        VoterToken token;
        bool exclusive;
    }

    /// @dev The FoundToken struct.
    /// @param currencyType The currency type of the token.
    /// @param version The version of the token.
    struct FoundToken {
        uint256 currencyType;
        uint16 version;
    }

    /// @dev The token id counter. Used to assign the currency type. Starts at 1.
    uint256 public tokenIdCounter;

    /// @dev The mapping of token id to TokenConfig.
    mapping(uint256 => TokenConfig) public tokensById;

    /// @dev The mapping of token symbol to token id.
    mapping(string => uint256) public tokenIdBySymbol;

    /// @dev The TokensUpdated event.
    event TokensUpdated();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    /**
     * @dev Registers a new token with the token registry. May only be called by the owner.
     * @param addr the new token registry address
     * @param exclusive when true matches for this token will be exclusive. All other tokens will be ignored.
     */
    function registerToken(address addr, bool exclusive) external onlyOwner {
        tokenIdCounter++;
        VoterToken token = VoterToken(addr);
        token.incrementVersion();

        tokensById[tokenIdCounter] = TokenConfig({
            currencyType: tokenIdCounter,
            token: token,
            exclusive: exclusive
        });

        tokenIdBySymbol[token.symbol()] = tokenIdCounter;
        emit TokensUpdated();
    }

    /**
     * @dev Updates a token registry entry. May only be called by the owner.
     * @param tokenId the token id to update
     * @param tokenAddr the new token registry address
     * @param exclusive when true matches for this token will be exclusive. All other tokens will be ignored.
     */
    function updateToken(
        uint256 tokenId,
        address tokenAddr,
        bool exclusive
    ) external onlyOwner {
        require(tokenId > 0 && tokenId <= tokenIdCounter, "Invalid token id");

        VoterToken token = VoterToken(tokenAddr);
        token.incrementVersion();

        tokensById[tokenId] = TokenConfig({
            currencyType: tokenId,
            token: token,
            exclusive: exclusive
        });

        tokenIdBySymbol[token.symbol()] = tokenId;
        emit TokensUpdated();
    }

    /**
     * @dev Updates the vote manager address for all tokens. May only be called by the owner.
     * @param voteManagerAddr the VoteManager address
     */
    function updateVoteManagerAddress(
        address voteManagerAddr
    ) external onlyOwner {
        for (uint256 i = 1; i <= tokenIdCounter; i++) {
            VoterToken vt = tokensById[i].token;
            vt.updateVoterManagerAddress(voteManagerAddr);
        }
    }

    /**
     * @dev Returns all token configs.
     */
    function getTokenConfigs() public view returns (TokenConfig[] memory) {
        TokenConfig[] memory tokens = new TokenConfig[](tokenIdCounter);
        for (uint256 i = 0; i < tokenIdCounter; i++) {
            tokens[i] = tokensById[i + 1];
        }
        return tokens;
    }

    /**
     * @dev Returns the token config for the given token id.
     * @param id the token id
     */
    function getTokenConfig(
        uint256 id
    ) public view returns (TokenConfig memory) {
        return tokensById[id];
    }

    /**
     * @dev Return VoterToken for the given token id.
     * @param id The token id
     * @return VoterToken
     */
    function getToken(uint256 id) public view returns (VoterToken) {
        return tokensById[id].token;
    }

    /**
     * @dev Return a list of token versions
     * @return VoterToken
     */
    function getTokenVersions() public view returns (uint16[] memory) {
        uint16[] memory versions = new uint16[](tokenIdCounter);
        for (uint256 i = 0; i < tokenIdCounter; i++) {
            versions[i] = tokensById[i + 1].token.version();
        }
        return versions;
    }

    /**
     * @dev Runs the validateArgon2Hash function on all tokens in the registry and returns a list of tokens that
      match the given hash with the token version to prevent race conditions during upgrades.
     * @param hash the argon2 hash string to validate. Only include the hash, not the salt or any other data.
     * @return Returns an array of currency types that match the given hash.
     */
    function findTokensFromArgon2Hash(
        string calldata hash,
        uint256 minedTimestamp
    ) public view returns (FoundToken[] memory) {
        FoundToken[] memory currencyTypes = new FoundToken[](tokenIdCounter);
        uint256 currencyTypeCount = 0;

        bool status;
        uint16 version;
        for (uint256 i = 1; i <= tokenIdCounter; i++) {
            TokenConfig memory tokenConfig = tokensById[i];
            (status, version) = tokenConfig.token.validateArgon2Hash(
                hash,
                minedTimestamp
            );
            if (status) {
                FoundToken memory foundToken = FoundToken({
                    currencyType: tokenConfig.currencyType,
                    version: version
                });

                if (tokenConfig.exclusive) {
                    FoundToken[] memory exclusiveResults = new FoundToken[](1);
                    exclusiveResults[0] = foundToken;
                    return exclusiveResults;
                }

                currencyTypes[currencyTypeCount] = foundToken;
                currencyTypeCount++;
            }
        }

        FoundToken[] memory results = new FoundToken[](currencyTypeCount);
        for (uint256 i = 0; i < currencyTypeCount; i++) {
            results[i] = currencyTypes[i];
        }

        return results;
    }
}
