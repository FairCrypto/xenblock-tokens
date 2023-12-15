// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Xenium is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    OwnableUpgradeable,
    ERC20PermitUpgradeable
{
    address public voteManager;

    // deprecated
    uint256 public hashId;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        address initalVoteManager
    ) public initializer {
        __ERC20_init("Xenium", "XNM");
        __ERC20Burnable_init();
        __Ownable_init(msg.sender);
        __ERC20Permit_init("Xenium");
        voteManager = initalVoteManager;
    }

    modifier onlyVoteManager() {
        require(
            msg.sender == voteManager,
            "Only vote manager can call this function."
        );
        _;
    }

    function mint(address to, uint256 amount) public onlyVoteManager {
        _mint(to, amount);
    }
}
