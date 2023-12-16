// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../abstracts/VoterToken.sol";

contract SuperBlock is VoterToken
{
    function initialize(
        address initialOwner,
        address initialVoteManager,
        address initialTokenRegistry
    ) public initializer {
        __ERC20_init("SuperBlock", "XBLK");
        __ERC20Burnable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("SuperBlock");
        voteManagerAddress = initialVoteManager;
        tokenRegistryAddress = initialTokenRegistry;
    }
}
