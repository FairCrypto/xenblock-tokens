# VoterToken

## Overview

#### License: MIT

```solidity
abstract contract VoterToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable, ERC20PermitUpgradeable
```

Author: The Faircrypto Team

The VoterToken abstract contract which all voter tokens must inherit from.
## State variables info

### version (0x54fd4d50)

```solidity
uint16 version
```

The version of the token. This increments every time the token is upgraded or modified.
### voteManagerAddress (0x4ab74f39)

```solidity
address voteManagerAddress
```

The address of the vote manager contract.
### tokenRegistryAddress (0x5be2aca0)

```solidity
address tokenRegistryAddress
```

The address of the token registry contract.
### amountPerHash (0x59bdf89f)

```solidity
uint256 amountPerHash
```

The amount of tokens (WEI) minted per hash.
### pattern (0xa96f1c69)

```solidity
string pattern
```

The pattern used to validate the argon2 hash.
## Modifiers info

### onlyVoteManager

```solidity
modifier onlyVoteManager()
```


### onlyTokenRegistryOrOwner

```solidity
modifier onlyTokenRegistryOrOwner()
```


## Functions info

### incrementVersion (0x2cf0a1fc)

```solidity
function incrementVersion() external onlyTokenRegistryOrOwner
```

increments the token's version number.
This should be call after every upgrade or modification to the token.
This will prevent the race condition where the validateArgon2Hash
function may return different results for the same hash between upgrades.
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

### updateVoterManagerAddress (0xf61c85d9)

```solidity
function updateVoterManagerAddress(
    address voteManagerAddress_
) external onlyTokenRegistryOrOwner
```

Updates the vote manager address. May only be called by the token registry or owner.


Parameters:

| Name                | Type    | Description                  |
| :------------------ | :------ | :--------------------------- |
| voteManagerAddress_ | address | the new vote manager address |

### updateAmountPerHash (0x4915fbaf)

```solidity
function updateAmountPerHash(uint256 amountPerHash_) external onlyOwner
```

Updates the amount of tokens (WEI) minted per hash.


Parameters:

| Name           | Type    | Description                              |
| :------------- | :------ | :--------------------------------------- |
| amountPerHash_ | uint256 | the new amount of tokens minted per hash |

### updatePattern (0x73743752)

```solidity
function updatePattern(string memory pattern_) external onlyOwner
```

Updates the pattern used to validate the argon2 hash.


Parameters:

| Name     | Type   | Description            |
| :------- | :----- | :--------------------- |
| pattern_ | string | the new pattern to use |

### mint (0x40c10f19)

```solidity
function mint(address to, uint256 amount) public onlyVoteManager
```

Mints tokens to the specified address. May only be called by the vote manager.


Parameters:

| Name   | Type    | Description                     |
| :----- | :------ | :------------------------------ |
| to     | address | The address to mint tokens to.  |
| amount | uint256 | The amount of tokens to mint.   |

### validateArgon2Hash (0x0a2374f2)

```solidity
function validateArgon2Hash(
    string calldata hash,
    uint256
) public view virtual returns (bool, uint16)
```

Validates the argon2 hash by checking if it contains the patten from the state variable `pattern`.


Parameters:

| Name | Type   | Description                                                                                 |
| :--- | :----- | :------------------------------------------------------------------------------------------ |
| hash | string | the argon2 hash string to validate. Only include the hash, not the salt or any other data.  |


Return values:

| Name | Type   | Description                                                |
| :--- | :----- | :--------------------------------------------------------- |
| [0]  | bool   | status Returns true if the hash is valid, false otherwise  |
| [1]  | uint16 | version Returns the version of the token.                  |
