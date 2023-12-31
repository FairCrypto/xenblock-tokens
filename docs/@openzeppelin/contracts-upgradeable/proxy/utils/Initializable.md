# Initializable

## Overview

#### License: MIT

```solidity
abstract contract Initializable
```

This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.

The initialization functions use a version number. Once a version number is used, it is consumed and cannot be
reused. This mechanism prevents re-execution of each "step" but allows the creation of new initialization steps in
case an upgrade adds a module that needs to be initialized.

For example:

[.hljs-theme-light.nopadding]
```solidity
contract MyToken is ERC20Upgradeable {
    function initialize() initializer public {
        __ERC20_init("MyToken", "MTK");
    }
}

contract MyTokenV2 is MyToken, ERC20PermitUpgradeable {
    function initializeV2() reinitializer(2) public {
        __ERC20Permit_init("MyToken");
    }
}
```

TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.

CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.

[CAUTION]
====
Avoid leaving a contract uninitialized.

An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
contract, which may impact the proxy. To prevent the implementation contract from being used, you should invoke
the {_disableInitializers} function in the constructor to automatically lock it when it is deployed:

[.hljs-theme-light.nopadding]
```
/// @custom:oz-upgrades-unsafe-allow constructor
constructor() {
    _disableInitializers();
}
```
====
## Structs info

### InitializableStorage

```solidity
struct InitializableStorage {
	uint64 _initialized;
	bool _initializing;
}
```

Storage of the initializable contract.

It's implemented on a custom ERC-7201 namespace to reduce the risk of storage collisions
when using with upgradeable contracts.


storage-location: erc7201:openzeppelin.storage.Initializable
## Events info

### Initialized

```solidity
event Initialized(uint64 version)
```

Triggered when the contract has been initialized or reinitialized.
## Errors info

### InvalidInitialization

```solidity
error InvalidInitialization()
```

The contract is already initialized.
### NotInitializing

```solidity
error NotInitializing()
```

The contract is not initializing.
## Modifiers info

### initializer

```solidity
modifier initializer()
```

A modifier that defines a protected initializer function that can be invoked at most once. In its scope,
`onlyInitializing` functions can be used to initialize parent contracts.

Similar to `reinitializer(1)`, except that in the context of a constructor an `initializer` may be invoked any
number of times. This behavior in the constructor can be useful during testing and is not expected to be used in
production.

Emits an {Initialized} event.
### reinitializer

```solidity
modifier reinitializer(uint64 version)
```

A modifier that defines a protected reinitializer function that can be invoked at most once, and only if the
contract hasn't been initialized to a greater version before. In its scope, `onlyInitializing` functions can be
used to initialize parent contracts.

A reinitializer may be used after the original initialization step. This is essential to configure modules that
are added through upgrades and that require initialization.

When `version` is 1, this modifier is similar to `initializer`, except that functions marked with `reinitializer`
cannot be nested. If one is invoked in the context of another, execution will revert.

Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
a contract, executing them in the right order is up to the developer or operator.

WARNING: Setting the version to 2**64 - 1 will prevent any future reinitialization.

Emits an {Initialized} event.
### onlyInitializing

```solidity
modifier onlyInitializing()
```

Modifier to protect an initialization function so that it can only be invoked by functions with the
{initializer} and {reinitializer} modifiers, directly or indirectly.