# TokenRegistry

## Overview

#### License: MIT

```solidity
contract TokenRegistry is Initializable, OwnableUpgradeable
```

Author: The Faircrypto Team

The TokenRegistry contract. A registry of all voter tokens.
## Structs info

### TokenConfig

```solidity
struct TokenConfig {
	uint256 currencyType;
	VoterToken token;
	bool exclusive;
}
```

The TokenConfig struct.


Parameters:

| Name         | Type                | Description                                                                                                    |
| :----------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| currencyType | uint256             | The currency type of the token.                                                                                |
| token        | contract VoterToken | The VoterToken contract.                                                                                       |
| exclusive    | bool                | When true, only this token will be used for validation. All others will be ignored when this token is matched. |

### FoundToken

```solidity
struct FoundToken {
	uint256 currencyType;
	uint16 version;
}
```

The FoundToken struct.


Parameters:

| Name         | Type    | Description                      |
| :----------- | :------ | :------------------------------- |
| currencyType | uint256 | The currency type of the token.  |
| version      | uint16  | The version of the token.        |

## Events info

### TokensUpdated

```solidity
event TokensUpdated()
```

The TokensUpdated event.
## State variables info

### tokenIdCounter (0x98bdf6f5)

```solidity
uint256 tokenIdCounter
```

The token id counter. Used to assign the currency type. Starts at 1.
### tokensById (0x346fc98b)

```solidity
mapping(uint256 => struct TokenRegistry.TokenConfig) tokensById
```

The mapping of token id to TokenConfig.
### tokenIdBySymbol (0xb4c33d3f)

```solidity
mapping(string => uint256) tokenIdBySymbol
```

The mapping of token symbol to token id.
## Functions info

### constructor

```solidity
constructor()
```

oz-upgrades-unsafe-allow: constructor
### initialize (0xc4d66de8)

```solidity
function initialize(address initialOwner) public initializer
```


### registerToken (0x6710b83f)

```solidity
function registerToken(address addr, bool exclusive) external onlyOwner
```

Registers a new token with the token registry. May only be called by the owner.


Parameters:

| Name      | Type    | Description                                                                           |
| :-------- | :------ | :------------------------------------------------------------------------------------ |
| addr      | address | the new token registry address                                                        |
| exclusive | bool    | when true matches for this token will be exclusive. All other tokens will be ignored. |

### updateToken (0xda8d73fa)

```solidity
function updateToken(
    uint256 tokenId,
    address tokenAddr,
    bool exclusive
) external onlyOwner
```

Updates a token registry entry. May only be called by the owner.


Parameters:

| Name      | Type    | Description                                                                           |
| :-------- | :------ | :------------------------------------------------------------------------------------ |
| tokenId   | uint256 | the token id to update                                                                |
| tokenAddr | address | the new token registry address                                                        |
| exclusive | bool    | when true matches for this token will be exclusive. All other tokens will be ignored. |

### updateVoteManagerAddress (0xf5b4751d)

```solidity
function updateVoteManagerAddress(address voteManagerAddr) external onlyOwner
```

Updates the vote manager address for all tokens. May only be called by the owner.


Parameters:

| Name            | Type    | Description             |
| :-------------- | :------ | :---------------------- |
| voteManagerAddr | address | the VoteManager address |

### getTokenConfigs (0x5547171d)

```solidity
function getTokenConfigs()
    public
    view
    returns (TokenRegistry.TokenConfig[] memory)
```

Returns all token configs.
### getTokenConfig (0x8a003888)

```solidity
function getTokenConfig(
    uint256 id
) public view returns (TokenRegistry.TokenConfig memory)
```

Returns the token config for the given token id.


Parameters:

| Name | Type    | Description  |
| :--- | :------ | :----------- |
| id   | uint256 | the token id |

### getToken (0xe4b50cb8)

```solidity
function getToken(uint256 id) public view returns (VoterToken)
```

Return VoterToken for the given token id.


Parameters:

| Name | Type    | Description   |
| :--- | :------ | :------------ |
| id   | uint256 | The token id  |


Return values:

| Name | Type                | Description |
| :--- | :------------------ | :---------- |
| [0]  | contract VoterToken | VoterToken  |

### getTokenVersions (0x7e519bd0)

```solidity
function getTokenVersions() public view returns (uint16[] memory)
```

Return a list of token versions


Return values:

| Name | Type     | Description |
| :--- | :------- | :---------- |
| [0]  | uint16[] | VoterToken  |

### findTokensFromArgon2Hash (0x7bbbe12d)

```solidity
function findTokensFromArgon2Hash(
    string calldata hash,
    uint256 minedTimestamp
) public view returns (TokenRegistry.FoundToken[] memory)
```

Runs the validateArgon2Hash function on all tokens in the registry and returns a list of tokens that
      match the given hash with the token version to prevent race conditions during upgrades.


Parameters:

| Name | Type   | Description                                                                                 |
| :--- | :----- | :------------------------------------------------------------------------------------------ |
| hash | string | the argon2 hash string to validate. Only include the hash, not the salt or any other data.  |


Return values:

| Name | Type                              | Description                                                   |
| :--- | :-------------------------------- | :------------------------------------------------------------ |
| [0]  | struct TokenRegistry.FoundToken[] | Returns an array of currency types that match the given hash. |
