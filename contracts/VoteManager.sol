// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./TokenRegistry.sol";
import "./interfaces/SFCLib.sol";
import "./interfaces/BlockStorage.sol";
import "./interfaces/VoterToken.sol";

contract ERC {
    function mint(address to, uint256 amount) public {}
}

contract VoteManager is Initializable, OwnableUpgradeable {
    SFCLib public sfcLib;
    BlockStorage public blockStorage;

    uint8 public votePercentage;

    // deprecated
    mapping(uint256 => bool) public mintedByHashId;
    mapping(uint256 => mapping(uint256 => bool))
        public votesByHashIdAndValidatorId;
    mapping(uint256 => mapping(uint8 => uint16))
        public votesByHashIdAndCurrencyType;
    //

    mapping(uint256 => mapping(uint256 => uint16))
    public newVotesByHashIdAndCurrencyType;

    TokenRegistry public tokenRegistry;

    mapping(uint256 => mapping(uint256 => bool)) public mintedByHashIdAndCurrencyType;

    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool)))
    public votesByHashIdAndValidatorIdAndCurrencyType;

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

    struct Payload {
        uint256 hashId;
        uint256 currencyType;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        address initialSfcAddress,
        address initialBlockStorageAddress,
        uint8 initialVotePercentage
    ) public initializer {
        __Ownable_init(initialOwner);
        blockStorage = BlockStorage(initialBlockStorageAddress);
        sfcLib = SFCLib(initialSfcAddress);
        votePercentage = initialVotePercentage;
    }

    function updateBlockStorageAddress(
        address _blockStorageAddress
    ) external onlyOwner {
        blockStorage = BlockStorage(_blockStorageAddress);
    }

    function updateSfcLibAddress(address _sfcLibAddress) external onlyOwner {
        sfcLib = SFCLib(_sfcLibAddress);
    }

    function updateTokenRegistryAddress(address _tokenRegistryAddress) external onlyOwner {
        tokenRegistry = TokenRegistry(_tokenRegistryAddress);
    }

    function updateVotePercentage(uint8 _votePercentage) external onlyOwner {
        require(
            _votePercentage >= 1 && _votePercentage <= 100,
            "Percentage must be between 1 and 100."
        );
        votePercentage = _votePercentage;
    }

    function requiredNumOfValidators() public view returns (uint256) {
        uint256 _validatorCount = validatorCount();
        return _requiredNumOfValidators(_validatorCount);
    }

    function _requiredNumOfValidators(
        uint256 _validatorCount
    ) internal view returns (uint256) {
        uint256 requiredVotes = (_validatorCount * votePercentage * 100) / 10000;
        if (requiredVotes == 0) {
            return 1;
        }
        return requiredVotes;
    }

    function validatorCount() public view returns (uint256) {
        // TODO: add a more efficient validator count to the SFC contract
        // for now we need to count the validators in the current epoch
        uint256 epoch = sfcLib.currentSealedEpoch();
        return sfcLib.getEpochValidatorIDs(epoch).length;
    }

    function _hasAlreadyVoted(
        uint256 _hashId,
        uint256 validatorId,
        uint256 _currencyType
    ) internal view returns (bool) {
        return votesByHashIdAndValidatorIdAndCurrencyType[_hashId][validatorId][_currencyType];
    }

    function _mintToken(uint256 _hashId, uint256 _currencyType) internal {
        address addr = tokenRegistry.getToken(_currencyType).addr;
        uint256 initalAmountPerHash = tokenRegistry.getToken(_currencyType).initalAmountPerHash;
        VoterToken token = VoterToken(addr);

        address account = blockStorage.addressesByHashId(_hashId);
        token.mint(account, initalAmountPerHash);

        mintedByHashIdAndCurrencyType[_hashId][_currencyType] = true;
        emit MintToken(_hashId, account, _currencyType);
    }

    function shouldVote(
        uint256 _validatorId,
        uint256 _hashId,
        uint256 _validatorCount
    ) public pure returns (bool) {
        // TODO: implement random selection with block number as seed
        // for now we just select Faircrypto's validators. 1, 2, & 3
        return 0 < _validatorId && _validatorId <= 3;
    }

    function _vote(uint256 _hashId, uint256 _currencyType) internal {
        require(mintedByHashIdAndCurrencyType[_hashId][_currencyType] == false, "Already minted");
        uint256 validatorId = sfcLib.getValidatorID(msg.sender);
        uint256 _validatorCount = validatorCount();
        uint256 requiredVotes = _requiredNumOfValidators(_validatorCount);

        require(validatorId > 0, "Not a validator");
        require(!_hasAlreadyVoted(_hashId, validatorId, _currencyType), "Already voted");
        require(
            shouldVote(validatorId, _hashId, _validatorCount),
            "Not a selected validator"
        );

        // Cast the vote
        votesByHashIdAndValidatorIdAndCurrencyType[_hashId][validatorId][_currencyType] = true;
        uint16 votes = newVotesByHashIdAndCurrencyType[_hashId][_currencyType] += 1;
        emit VoteToken(_hashId, validatorId, _currencyType, votes);

        // Mint the token if the vote threshold is reached
        if (votes >= requiredVotes) {
            _mintToken(_hashId, _currencyType);
        }
    }

    function vote(uint256 _hashId, uint256 _currencyType) external {
        _vote(_hashId, _currencyType);
    }

    function voteBatch(Payload[] memory payload) external {
        require(payload.length > 0, "Invalid input");
        for (uint256 i = 0; i < payload.length; i++) {
            // TODO: error handling
            _vote(payload[i].hashId, payload[i].currencyType);
        }
    }
}
