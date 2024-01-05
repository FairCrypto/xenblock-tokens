# ERC20BurnableUpgradeable

## Overview

#### License: MIT

```solidity
abstract contract ERC20BurnableUpgradeable is Initializable, ContextUpgradeable, ERC20Upgradeable
```

Extension of {ERC20} that allows token holders to destroy both their own
tokens and those that they have an allowance for, in a way that can be
recognized off-chain (via event analysis).
## Functions info

### burn (0x42966c68)

```solidity
function burn(uint256 value) public virtual
```

Destroys a `value` amount of tokens from the caller.

See {ERC20-_burn}.
### burnFrom (0x79cc6790)

```solidity
function burnFrom(address account, uint256 value) public virtual
```

Destroys a `value` amount of tokens from `account`, deducting from
the caller's allowance.

See {ERC20-_burn} and {ERC20-allowance}.

Requirements:

- the caller must have allowance for ``accounts``'s tokens of at least
`value`.