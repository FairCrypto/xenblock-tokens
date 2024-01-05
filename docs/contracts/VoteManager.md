# VoteManager

## Overview

#### License: MIT

```solidity
contract VoteManager is Initializable, OwnableUpgradeable
```

Author: The Faircrypto Team

The VoteManager contract which handles voting and minting of Xen Block tokens
## Structs info

### VotePayload

```solidity
struct VotePayload {
	uint256 hashId;
	uint256 currencyType;
	uint256 mintedBlockNumber;
	uint16 version;
}
```

The VotePayload struct.


Parameters:

| Name              | Type    | Description                                                                                           |
| :---------------- | :------ | :---------------------------------------------------------------------------------------------------- |
| hashId            | uint256 | The hash id of the token.                                                                             |
| currencyType      | uint256 | The currency type of the token.                                                                       |
| mintedBlockNumber | uint256 | The block number the token was minted on BlockStorage.                                                |
| version           | uint16  | The version of the token. Used to verify the token has not been upgraded since validation took place. |

## Events info

### MintToken

```solidity
event MintToken(uint256 indexed hashId, address indexed account, uint256 indexed currencyType)
```

The MintToken event.
### VoteToken

```solidity
event VoteToken(uint256 indexed hashId, uint256 indexed validatorId, uint256 indexed currencyType, uint16 votes)
```

The VoteToken event.
## State variables info

### sfc (0x8992229f)

```solidity
contract SFC sfc
```

The SFC contract.
### blockStorage (0x4a673e98)

```solidity
contract BlockStorage blockStorage
```

The BlockStorage contract.
### tokenRegistry (0x9d23c4c7)

```solidity
contract TokenRegistry tokenRegistry
```

The TokenRegistry contract.
### votePercentage (0x34b502c0)

```solidity
uint8 votePercentage
```

The percentage of validators that must vote for a token to be minted
### voteBufferPercent (0xa2379199)

```solidity
uint8 voteBufferPercent
```

The percentage of extra votes asked for to cover any missing validator votes
### votesByHashIdAndCurrencyType (0x348fbd64)

```solidity
mapping(uint256 => mapping(uint256 => uint16)) votesByHashIdAndCurrencyType
```

The mapping of hash id to currency type to votes.
### votesByHashIdAndValidatorIdAndCurrencyType (0x95c6286c)

```solidity
mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) votesByHashIdAndValidatorIdAndCurrencyType
```

The mapping of hash id to currency type to validator id to vote.
### mintedByHashIdAndCurrencyType (0x47ce239d)

```solidity
mapping(uint256 => mapping(uint256 => bool)) mintedByHashIdAndCurrencyType
```

The mapping of hash id to currency type to minted.
## Functions info

### constructor

```solidity
constructor()
```

oz-upgrades-unsafe-allow: constructor
### initialize (0x903cd3e3)

```solidity
function initialize(
    address initialOwner,
    address initialSfcAddress,
    address initialBlockStorageAddress,
    uint8 initialVotePercentage,
    uint8 initialVoteBufferPercent
) public initializer
```


### updateBlockStorageAddress (0x3cc66f46)

```solidity
function updateBlockStorageAddress(
    address blockStorageAddress
) external onlyOwner
```

Updates the block storage address. May only be called by the owner.


Parameters:

| Name                | Type    | Description                   |
| :------------------ | :------ | :---------------------------- |
| blockStorageAddress | address | the new block storage address |

### updateSfcAddress (0xcbb9d8c9)

```solidity
function updateSfcAddress(address sfcAddress) external onlyOwner
```

Updates the SFC address. May only be called by the owner.


Parameters:

| Name       | Type    | Description         |
| :--------- | :------ | :------------------ |
| sfcAddress | address | the new SFC address |

### updateTokenRegistryAddress (0x520051d7)

```solidity
function updateTokenRegistryAddress(
    address tokenRegistryAddress_
) external onlyOwner
```

Updates the token registry address. May only be called by the owner.


Parameters:

| Name                  | Type    | Description                    |
| :-------------------- | :------ | :----------------------------- |
| tokenRegistryAddress_ | address | the new token registry address |

### updateVotePercentage (0x8ba8405c)

```solidity
function updateVotePercentage(uint8 votePercentage_) external onlyOwner
```

Updates the vote percentage. This is the percentage of validators that must vote per hash.
May only be called by the owner.


Parameters:

| Name            | Type  | Description             |
| :-------------- | :---- | :---------------------- |
| votePercentage_ | uint8 | the new vote percentage |

### updateVoteBufferPercentage (0xf3a3a784)

```solidity
function updateVoteBufferPercentage(
    uint8 voteBufferPercent_
) external onlyOwner
```

Updates the vote buffer percentage. This is the percentage of extra votes asked for to cover any missing validator votes.
For example, if the vote percentage is 50% and the vote buffer percentage is 50% then 75% of validators must vote for a token to be minted.
May only be called by the owner.


Parameters:

| Name               | Type  | Description                    |
| :----------------- | :---- | :----------------------------- |
| voteBufferPercent_ | uint8 | the new vote buffer percentage |

### requiredNumOfValidators (0x5370c435)

```solidity
function requiredNumOfValidators() public view returns (uint256)
```

Returns the requested number of validators to vote.
This number includes the buffer percentage.
### requiredNumOfVotes (0x27b26533)

```solidity
function requiredNumOfVotes() public view returns (uint256)
```

Returns the required number of votes for a token to be minted.
### validatorCount (0x0f43a677)

```solidity
function validatorCount() public view returns (uint256)
```

Returns the number of validators in the current epoch.
### shouldVote (0xb1faefbb)

```solidity
function shouldVote(
    uint256 mintedBlockNumber,
    uint256 validatorId,
    uint256 hashId
) public view returns (bool)
```

Returns true if the validator should vote for the given hash.
### voteBatch (0xe53edd93)

```solidity
function voteBatch(VoteManager.VotePayload[] calldata payload) external
```

Casts a batch of votes for a list of hashes. May only be called by a validator.


Parameters:

| Name    | Type                             | Description               |
| :------ | :------------------------------- | :------------------------ |
| payload | struct VoteManager.VotePayload[] | An array of votes to cast |
