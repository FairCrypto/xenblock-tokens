// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../abstracts/VoterToken.sol";

/// @author The Faircrypto Team
/// @dev The Xenium Token
contract Xenium is VoterToken {
    function initialize(
        address initialOwner,
        address initialVoteManager,
        address initialTokenRegistry
    ) public initializer {
        __ERC20_init("Xenium", "XNM");
        __ERC20Burnable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("Xenium");
        voteManagerAddress = initialVoteManager;
        tokenRegistryAddress = initialTokenRegistry;
        amountPerHash = 10000000000000000000;
        pattern = "XEN11";
    }
}
