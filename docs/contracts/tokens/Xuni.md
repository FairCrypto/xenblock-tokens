# Xuni

## Overview

#### License: MIT

```solidity
contract Xuni is VoterToken
```

Author: The Faircrypto Team

The Xuni Token
## State variables info

### enforceTimestampCheck (0x49bcb1e8)

```solidity
bool enforceTimestampCheck
```

When true the timestamp check will be enforced.
## Functions info

### initialize (0xc0c53b8b)

```solidity
function initialize(
    address initialOwner,
    address initialVoteManager,
    address initialTokenRegistry
) public initializer
```


### updateEnforceTimestampCheck (0x5a4ce9b0)

```solidity
function updateEnforceTimestampCheck(
    bool enforceTimestampCheck_
) public onlyOwner
```

Updates the enforceTimestampCheck state variable to be able to enable/disable the timestamp checks.
We will enable this check once we switch away from xenblocks.io.


Parameters:

| Name                   | Type | Description                          |
| :--------------------- | :--- | :----------------------------------- |
| enforceTimestampCheck_ | bool | the new value for the state variable |

### validateArgon2Hash (0x0a2374f2)

```solidity
function validateArgon2Hash(
    string calldata hash,
    uint256 minedTimestamp
) public view override returns (bool, uint16)
```

Validates `hash`

Validates the argon2 hash by checking if it contains a pattern from the state variable `patterns`
and if the block timestamp is within 5 minutes of the hour.


Parameters:

| Name           | Type    | Description                                                                                  |
| :------------- | :------ | :------------------------------------------------------------------------------------------- |
| hash           | string  | the argon2 hash string to validate. Only include the hash, not the salt or any other data.   |
| minedTimestamp | uint256 | the timestamp of the block the hash was mined in. It can be used for additional validation.  |


Return values:

| Name | Type   | Description                                                 |
| :--- | :----- | :---------------------------------------------------------- |
| [0]  | bool   | status Returns true if the hash is valid, false otherwise.  |
| [1]  | uint16 | version Returns the version of the token.                   |
