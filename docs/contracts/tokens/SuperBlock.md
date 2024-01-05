# SuperBlock

## Overview

#### License: MIT

```solidity
contract SuperBlock is VoterToken
```

Author: The Faircrypto Team

The Superblock Token
## Constants info

### CAPITAL_LETTERS (0xd4de87ec)

```solidity
uint8 constant CAPITAL_LETTERS = 50
```


## Functions info

### initialize (0xc0c53b8b)

```solidity
function initialize(
    address initialOwner,
    address initialVoteManager,
    address initialTokenRegistry
) public initializer
```


### validateArgon2Hash (0x0a2374f2)

```solidity
function validateArgon2Hash(
    string calldata hash,
    uint256
) public view override returns (bool, uint16)
```

Validates `hash`

Validates the argon2 hash by checking if it contains the string from the state variable `pattern` and at least 50 capital letters.


Parameters:

| Name | Type   | Description                                                                                 |
| :--- | :----- | :------------------------------------------------------------------------------------------ |
| hash | string | the argon2 hash string to validate. Only include the hash, not the salt or any other data.  |


Return values:

| Name | Type   | Description                                                 |
| :--- | :----- | :---------------------------------------------------------- |
| [0]  | bool   | status Returns true if the hash is valid, false otherwise.  |
| [1]  | uint16 | version Returns the version of the token.                   |
