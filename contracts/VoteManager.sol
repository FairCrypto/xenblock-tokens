// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./TokenRegistry.sol";
import "./interfaces/SFC.sol";
import "./interfaces/BlockStorage.sol";
import "./abstracts/VoterToken.sol";
import "hardhat/console.sol";

error VersionMismatch();
error NotAValidator();

contract VoteManager is Initializable, OwnableUpgradeable {
    SFC public sfc;
    BlockStorage public blockStorage;
    TokenRegistry public tokenRegistry;

    struct VotePayload {
        uint256 hashId;
        uint256 currencyType;
        uint256 mintedBlockNumber;
        uint16 version;
    }

    // The percentage of validators that must vote for a token to be minted
    uint8 public votePercentage;

    // The percentage of extra votes asked for to cover any missing validator votes
    uint8 public voteBufferPercent;

    mapping(uint256 => mapping(uint256 => uint16))
        public votesByHashIdAndCurrencyType;

    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool)))
        public votesByHashIdAndValidatorIdAndCurrencyType;

    mapping(uint256 => mapping(uint256 => bool))
        public mintedByHashIdAndCurrencyType;

    event MintToken(
        uint256 indexed hashId,
        address indexed account,
        uint256 indexed currencyType
    );

    event VoteToken(
        uint256 indexed hashId,
        uint256 indexed validatorId,
        uint256 indexed currencyType,
        uint16 votes
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        address initialSfcAddress,
        address initialBlockStorageAddress,
        uint8 initialVotePercentage,
        uint8 initialVoteBufferPercent
    ) public initializer {
        __Ownable_init(initialOwner);
        blockStorage = BlockStorage(initialBlockStorageAddress);
        sfc = SFC(initialSfcAddress);
        votePercentage = initialVotePercentage;
        voteBufferPercent = initialVoteBufferPercent;
    }

    function updateBlockStorageAddress(
        address blockStorageAddress
    ) external onlyOwner {
        blockStorage = BlockStorage(blockStorageAddress);
    }

    function updateSfcAddress(address sfcAddress) external onlyOwner {
        sfc = SFC(sfcAddress);
    }

    function updateTokenRegistryAddress(
        address tokenRegistryAddress_
    ) external onlyOwner {
        tokenRegistry = TokenRegistry(tokenRegistryAddress_);
    }

    function updateVotePercentage(uint8 votePercentage_) external onlyOwner {
        require(
            votePercentage_ >= 1 && votePercentage_ <= 100,
            "Percentage must be between 1 and 100."
        );
        votePercentage = votePercentage_;
    }

    function updateVoteBufferPercentage(
        uint8 voteBufferPercent_
    ) external onlyOwner {
        require(
            voteBufferPercent_ >= 1 && voteBufferPercent_ <= 100,
            "Percentage must be between 1 and 100."
        );
        voteBufferPercent = voteBufferPercent_;
    }

    function requiredNumOfValidators() public view returns (uint256) {
        uint256 validatorCount_ = validatorCount();
        return _requiredNumOfValidators(validatorCount_);
    }

    function requiredNumOfVotes() public view returns (uint256) {
        uint256 validatorCount_ = validatorCount();
        return _requiredNumOfVotes(validatorCount_);
    }

    function _requiredNumOfValidators(
        uint256 validatorCount_
    ) internal view returns (uint256) {
        uint256 requiredVotes = _requiredNumOfVotes(validatorCount_);
        uint256 requiredValidators = requiredVotes +
            ((requiredVotes * voteBufferPercent * 100) / 10000);
        return Math.min(validatorCount_, requiredValidators);
    }

    function _requiredNumOfVotes(
        uint256 validatorCount_
    ) internal view returns (uint256) {
        uint256 requiredVotes = (validatorCount_ * votePercentage * 100) /
            10000;
        if (requiredVotes == 0) {
            return 1;
        }
        return requiredVotes;
    }

    function validatorCount() public view returns (uint256) {
        // TODO: add a more efficient validator count to the SFC contract
        // for now we need to count the validators in the current epoch
        uint256 epoch = sfc.currentSealedEpoch();
        return sfc.getEpochValidatorIDs(epoch).length;
    }

    function _hasBeenMinted(
        uint256 hashId,
        uint256 currencyType
    ) internal view returns (bool) {
        return mintedByHashIdAndCurrencyType[hashId][currencyType];
    }

    function _markAsMinted(uint256 hashId, uint256 currencyType) internal {
        mintedByHashIdAndCurrencyType[hashId][currencyType] = true;
    }

    function _hasAlreadyVoted(
        uint256 hashId,
        uint256 validatorId,
        uint256 currencyType
    ) internal view returns (bool) {
        return
            votesByHashIdAndValidatorIdAndCurrencyType[hashId][validatorId][
                currencyType
            ];
    }

    function _mintToken(uint256 hashId, uint256 currencyType) internal {
        address account = blockStorage.addressesByHashId(hashId);

        VoterToken token = tokenRegistry.getToken(currencyType);
        token.mint(account, token.amountPerHash());

        _markAsMinted(hashId, currencyType);
        emit MintToken(hashId, account, currencyType);
    }

    function shouldVote(
        uint256 mintedBlockNumber,
        uint256 validatorId,
        uint256 hashId
    ) public view returns (bool) {
        return
            _shouldVote(
                mintedBlockNumber,
                validatorId,
                hashId,
                validatorCount()
            );
    }

    // TODO: implement random selection with block number as seed
    // for now we just select Faircrypto's validators. 1, 2, & 3
    function _shouldVote(
        uint256 /*mintedBlockNumber*/,
        uint256 validatorId,
        uint256 /*hashId*/,
        uint256 /*validatorCount_*/
    ) internal pure returns (bool) {
        return 0 < validatorId && validatorId <= 3;
    }

    function _vote(
        uint256 hashId,
        uint256 currencyType,
        uint256 validatorId
    ) internal returns (uint16) {
        // Cast the vote
        votesByHashIdAndValidatorIdAndCurrencyType[hashId][validatorId][
            currencyType
        ] = true;
        uint16 votes = votesByHashIdAndCurrencyType[hashId][currencyType] += 1;
        emit VoteToken(hashId, validatorId, currencyType, votes);

        return votes;
    }

    function voteBatch(VotePayload[] calldata payload) external {
        uint256 validatorId = sfc.getValidatorID(msg.sender);
        uint256 validatorCount_ = validatorCount();
        uint256 requiredVotes = _requiredNumOfValidators(validatorCount_);

        if (validatorId < 1) {
            revert NotAValidator();
        }

        uint16[] memory cachedVersions = tokenRegistry.getTokenVersions();

        for (uint256 i = 0; i < payload.length; i++) {
            uint256 hashId = payload[i].hashId;
            uint256 currencyType = payload[i].currencyType;
            uint256 mintedBlockNumber = payload[i].mintedBlockNumber;
            uint16 version = payload[i].version;

            // Check the token version
            // this protects against a race condition during a token upgrade
            // if this fails the validator will need to re-verify each hash and resubmit
            if (version > 0 && cachedVersions[currencyType - 1] != version) {
                revert VersionMismatch();
            }

            if (_hasBeenMinted(hashId, currencyType)) {
                continue;
            }

            if (_hasAlreadyVoted(hashId, validatorId, currencyType)) {
                continue;
            }

            if (
                !_shouldVote(
                    mintedBlockNumber,
                    validatorId,
                    hashId,
                    validatorCount_
                )
            ) {
                continue;
            }

            uint16 votes = _vote(hashId, currencyType, validatorId);

            // Mint the token if the vote threshold is reached
            if (votes >= requiredVotes) {
                _mintToken(hashId, currencyType);
            }
        }
    }
}
