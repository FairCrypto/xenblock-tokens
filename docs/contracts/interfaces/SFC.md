# SFC

## Overview

#### License: MIT

```solidity
contract SFC
```


## Structs info

### EpochSnapshot

```solidity
struct EpochSnapshot {
	mapping(uint256 => uint256) receivedStake;
	mapping(uint256 => uint256) accumulatedRewardPerToken;
	mapping(uint256 => uint256) accumulatedUptime;
	mapping(uint256 => uint256) accumulatedOriginatedTxsFee;
	mapping(uint256 => uint256) offlineTime;
	mapping(uint256 => uint256) offlineBlocks;
	uint256[] validatorIDs;
	uint256 endTime;
	uint256 epochFee;
	uint256 totalBaseRewardWeight;
	uint256 totalTxRewardWeight;
	uint256 baseRewardPerSecond;
	uint256 totalStake;
	uint256 totalSupply;
}
```


## State variables info

### getValidatorID (0x0135b1db)

```solidity
mapping(address => uint256) getValidatorID
```


### getEpochSnapshot (0x39b80c00)

```solidity
mapping(uint256 => struct SFC.EpochSnapshot) getEpochSnapshot
```


### currentSealedEpoch (0x7cacb1d6)

```solidity
uint256 currentSealedEpoch
```


## Functions info

### getEpochValidatorIDs (0xb88a37e2)

```solidity
function getEpochValidatorIDs(
    uint256 epoch
) public view returns (uint256[] memory)
```

