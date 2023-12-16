# XenBlocks Tokens

## Install

```shell
npm install

// for deployment
export PRIVATE_KEY=<private key>
```

## Deploy Contracts

The initial deployment of the contracts is done using the `create-*` scripts. The `upgrade-*` scripts are used to upgrade the contracts.

For convenience, the `create-all` script will deploy and verify all contracts.

```shell
npx hardhat run scripts/create-all.ts --network x1-testnet

# add the env variables to .env
```

## Verify Contracts

```shell
source .env
npx hardhat verify $VOTE_MANAGER_ADDRESS --network x1-testnet
npx hardhat verify $XENIUM_ADDRESS --network x1-testnet
npx hardhat verify $XUNI_ADDRESS --network x1-testnet
npx hardhat verify $SUPER_BLOCK_ADDRESS --network x1-testnet
npx hardhat verify $TOKEN_REGISTRY_ADDRESS --network x1-testnet
```

## Upgrade Contracts

> Upgrade vote manager

```shell
npx hardhat run scripts/upgrade-vote-manager.ts --network x1-testnet
```

> Upgrade xenium

```shell
npx hardhat run scripts/upgrade-xenium.ts --network x1-testnet
```

> Upgrade xuni

```shell
npx hardhat run scripts/upgrade-xuni.ts --network x1-testnet
```

> Upgrade Superblock

```shell
npx hardhat run scripts/upgrade-super-block.ts --network x1-testnet
```

> Upgrade token registry

```shell
npx hardhat run scripts/upgrade-token-registry.ts --network x1-testnet
```
