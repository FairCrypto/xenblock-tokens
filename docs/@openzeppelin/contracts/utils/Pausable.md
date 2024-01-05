# Pausable

## Overview

#### License: MIT

```solidity
abstract contract Pausable is Context
```

Contract module which allows children to implement an emergency stop
mechanism that can be triggered by an authorized account.

This module is used through inheritance. It will make available the
modifiers `whenNotPaused` and `whenPaused`, which can be applied to
the functions of your contract. Note that they will not be pausable by
simply including this module, only once the modifiers are put in place.
## Events info

### Paused

```solidity
event Paused(address account)
```

Emitted when the pause is triggered by `account`.
### Unpaused

```solidity
event Unpaused(address account)
```

Emitted when the pause is lifted by `account`.
## Errors info

### EnforcedPause

```solidity
error EnforcedPause()
```

The operation failed because the contract is paused.
### ExpectedPause

```solidity
error ExpectedPause()
```

The operation failed because the contract is not paused.
## Modifiers info

### whenNotPaused

```solidity
modifier whenNotPaused()
```

Modifier to make a function callable only when the contract is not paused.

Requirements:

- The contract must not be paused.
### whenPaused

```solidity
modifier whenPaused()
```

Modifier to make a function callable only when the contract is paused.

Requirements:

- The contract must be paused.
## Functions info

### paused (0x5c975abb)

```solidity
function paused() public view virtual returns (bool)
```

Returns true if the contract is paused, and false otherwise.