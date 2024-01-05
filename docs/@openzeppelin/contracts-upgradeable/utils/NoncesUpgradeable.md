# NoncesUpgradeable

## Overview

#### License: MIT

```solidity
abstract contract NoncesUpgradeable is Initializable
```

Provides tracking nonces for addresses. Nonces will only increment.
## Structs info

### NoncesStorage

```solidity
struct NoncesStorage {
	mapping(address => uint256) _nonces;
}
```

storage-location: erc7201:openzeppelin.storage.Nonces
## Errors info

### InvalidAccountNonce

```solidity
error InvalidAccountNonce(address account, uint256 currentNonce)
```

The nonce used for an `account` is not the expected current nonce.
## Functions info

### nonces (0x7ecebe00)

```solidity
function nonces(address owner) public view virtual returns (uint256)
```

Returns the next unused nonce for an address.