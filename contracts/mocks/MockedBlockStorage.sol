// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2; // Enable ABI coder v2

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MockedBlockStorage is Ownable(msg.sender), Pausable {
    struct HashRecord {
        uint8 c;
        uint32 m;
        uint8 t;
        uint8 v;
        bytes32 k;
        bytes s;
    }

    uint256 public constant TARGET_BLOCK_TIME_S = 1;
    uint256 public constant DIFFICULTY_ADJUSTMENT = 2_000;

    // hash ID => hash record
    mapping(uint256 => bytes) public hashRecords;
    // address => idx => hash ID
    mapping(address => mapping(uint256 => uint256)) public hashIdsByAddress;
    // address => record counter
    mapping(address => uint256) public recordCount;
    // hash ID => account address
    mapping(uint256 => address) public addressesByHashId;
    // key => account address
    mapping(bytes32 => address) public addressesByKey;
    // hourly timestamp => hash ID => account address
    // mapping(uint256 => mapping(uint256 => address)) public hourlyRecords;

    uint256 public variance = 20; // is set in constructor
    uint256 public epochDurationSec = 600; // is set by authority
    // uint256 public epochDurationSec = 3_600;       // is set by authority
    uint256 public targetDifficulty = 100_000; // is set by authority
    uint256 public currentHashId; // increments with each new Hash
    uint256 public currentEpoch; // increments every epoch
    uint256 public currentEpochTs; // is set every epoch
    uint256 public difficulty; // ie set every epoch
    uint256 public epochHashCounter; // resets every epoch

    constructor(uint256 _currentEpoch, uint256 _difficulty, uint256 _variance) {
        currentEpoch = _currentEpoch > 0 ? _currentEpoch : 1;
        difficulty = _difficulty > 0 ? _difficulty : targetDifficulty;
        currentEpochTs = block.timestamp;
        variance = _variance > 0 ? _variance : variance;
    }

    event NewHash(
        uint256 indexed hashId,
        uint256 indexed epoch,
        address indexed account,
        uint256 ts,
        bytes _bytes
    );
    event NewEpoch(uint256 indexed epoch, uint256 difficulty, uint256 ts);
    event EpochDurationSet(uint256 indexed epoch, uint256 indexed duration);
    event TargetDifficultySet(
        uint256 indexed epoch,
        uint256 indexed difficulty
    );

    function setEpochDurationSec(uint256 _epochDurationSec) external onlyOwner {
        require(_epochDurationSec > 0, "X1: Illegal Epoch Duration");
        epochDurationSec = _epochDurationSec;
        emit EpochDurationSet(currentEpoch, _epochDurationSec);
    }

    function setTargetDifficulty(uint256 _targetDifficulty) external onlyOwner {
        require(_targetDifficulty > 0, "X1: Illegal Difficulty");
        targetDifficulty = _targetDifficulty;
    }

    function lockDifficulty() external onlyOwner {
        _pause();
    }

    function unlockDifficulty() external onlyOwner {
        _unpause();
    }

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        require(_difficulty > 0, "X1: Illegal Difficulty");
        difficulty = _difficulty;
    }

    function doHousekeeping() public {
        if (block.timestamp - currentEpochTs > epochDurationSec) {
            currentEpochTs = block.timestamp;
            currentEpoch++;
            uint256 targetHashCount = epochDurationSec / TARGET_BLOCK_TIME_S;
            uint256 lowerBound = (targetHashCount * (100 - variance)) / 100;
            uint256 upperBound = (targetHashCount * (100 + variance)) / 100;
            if (epochHashCounter < lowerBound && !paused()) {
                difficulty -= DIFFICULTY_ADJUSTMENT;
            } else if (epochHashCounter > upperBound && !paused()) {
                difficulty += DIFFICULTY_ADJUSTMENT;
            }
            epochHashCounter = 0;
            emit NewEpoch(currentEpoch, difficulty, currentEpochTs);
        }
    }

    function _storeRecord(
        address _address,
        uint256 _hashId,
        bytes memory _bytes
    ) internal returns (bool) {
        if (addressesByHashId[_hashId] != address(0)) return false;
        (, , , , bytes32 k, ) = decodeRecordBytes(_bytes);
        if (addressesByKey[k] != address(0)) return false;

        hashRecords[_hashId] = _bytes;
        hashIdsByAddress[_address][++recordCount[_address]] = _hashId;
        addressesByHashId[_hashId] = _address;
        addressesByKey[k] = _address;
        return true;
    }

    function _storeNewRecord(
        address _address,
        uint256 _hashId,
        bytes memory _bytes
    ) internal {
        require(
            _storeRecord(_address, _hashId, _bytes),
            "X1: Duplicate HashId or Key"
        );
        emit NewHash(_hashId, currentEpoch, _address, block.timestamp, _bytes);
        epochHashCounter++;
        // this is done as the last step to avoid using new epoch values
        doHousekeeping(); // check / start new epoch if required
    }

    function storeNewRecord(address _address, HashRecord calldata r) external {
        _storeNewRecord(
            _address,
            ++currentHashId,
            abi.encodePacked(r.c, r.m, r.t, r.v, r.k, r.s)
        );
    }

    function storeNewRecordData(
        address _address,
        uint8 c,
        uint32 m,
        uint8 t,
        uint8 v,
        bytes32 k,
        bytes calldata s
    ) external {
        _storeNewRecord(
            _address,
            ++currentHashId,
            abi.encodePacked(c, m, t, v, k, s)
        );
    }

    function storeNewRecordBytes(
        address _address,
        bytes calldata _bytes
    ) external {
        _storeNewRecord(_address, ++currentHashId, _bytes);
    }

    function bulkStoreNewRecords(
        address[] calldata addresses,
        bytes[] calldata bb
    ) external {
        require(addresses.length == bb.length, "X1: Array Length Mismatch");
        require(addresses.length > 0, "X1: Empty Array");
        for (uint i = 0; i < bb.length; i++) {
            bool ok = _storeRecord(addresses[i], ++currentHashId, bb[i]);
            if (ok) {
                emit NewHash(
                    currentHashId,
                    currentEpoch,
                    addresses[i],
                    block.timestamp,
                    bb[i]
                );
                epochHashCounter++;
            }
        }
        doHousekeeping(); // check / start new epoch if required
    }

    function bulkStoreRecordsInc(
        address _address,
        HashRecord[] calldata hh
    ) external {
        for (uint i = 0; i < hh.length; i++) {
            _storeRecord(
                _address,
                ++currentHashId,
                abi.encodePacked(
                    hh[i].c,
                    hh[i].m,
                    hh[i].t,
                    hh[i].v,
                    hh[i].k,
                    hh[i].s
                )
            );
        }
    }

    function bulkStoreRecordBytesInc(
        address _address,
        bytes[] calldata bb
    ) external {
        for (uint i = 0; i < bb.length; i++) {
            _storeRecord(_address, ++currentHashId, bb[i]);
        }
    }

    function bulkStoreRecords(
        address _address,
        uint256[] calldata _hasIds,
        HashRecord[] calldata hh
    ) external {
        for (uint i = 0; i < hh.length; i++) {
            _storeRecord(
                _address,
                _hasIds[i],
                abi.encodePacked(
                    hh[i].c,
                    hh[i].m,
                    hh[i].t,
                    hh[i].v,
                    hh[i].k,
                    hh[i].s
                )
            );
        }
    }

    function bulkStoreRecordBytes(
        address _address,
        uint256[] calldata _hasIds,
        bytes[] calldata bb
    ) external {
        for (uint i = 0; i < bb.length; i++) {
            _storeRecord(_address, _hasIds[i], bb[i]);
        }
    }

    function getBytesLen(
        address _address,
        uint256 _index
    ) external view returns (uint len) {
        bytes memory _data = hashRecords[hashIdsByAddress[_address][_index]];
        assembly {
            len := mload(_data)
        }
    }

    function decodeRecordBytes(
        bytes memory _data
    )
        public
        pure
        returns (uint8 c, uint32 m, uint8 t, uint8 v, bytes32 k, bytes memory s)
    {
        uint len;
        assembly {
            len := mload(_data)
            c := mload(add(_data, 1))
            m := mload(add(_data, 5))
            t := mload(add(_data, 6))
            v := mload(add(_data, 7))
            k := mload(add(_data, 39))
        }
        s = new bytes(len - 39);
        assembly {
            // Skip the first 32 bytes reserved for the length of the memory array
            let offset := add(s, 0x20)
            let count := sub(len, 39)
            for {
                let i := 0
            } lt(i, count) {
                i := add(i, 1)
            } {
                mstore8(add(offset, i), mload(add(_data, add(40, i))))
            }
        }
    }

    function decodeRecordBytes(
        uint256 _hashId
    )
        public
        view
        returns (uint8 c, uint32 m, uint8 t, uint8 v, bytes32 k, bytes memory s)
    {
        return decodeRecordBytes(hashRecords[_hashId]);
    }

    function decodeRecordBytes(
        address _address,
        uint256 _idx
    )
        public
        view
        returns (uint8 c, uint32 m, uint8 t, uint8 v, bytes32 k, bytes memory s)
    {
        return decodeRecordBytes(hashIdsByAddress[_address][_idx]);
    }

    function getHashIdsByAddress(
        address _address
    ) public view returns (uint256[] memory ids) {
        uint256 count = recordCount[_address];
        ids = new uint256[](count);
        for (uint i = 0; i < count; i++) {
            ids[i] = hashIdsByAddress[_address][i + 1];
        }
    }

    function getRecordsByAddress(
        address _address
    ) public view returns (HashRecord[] memory recs) {
        uint256 count = recordCount[_address];
        recs = new HashRecord[](count);
        for (uint i = 0; i < count; i++) {
            uint256 hashId = hashIdsByAddress[_address][i + 1];
            (
                recs[i].c,
                recs[i].m,
                recs[i].t,
                recs[i].v,
                recs[i].k,
                recs[i].s
            ) = decodeRecordBytes(hashId);
        }
    }
}
