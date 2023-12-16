// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract VoterToken is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    OwnableUpgradeable,
    ERC20PermitUpgradeable
{
    address public voteManagerAddress;
    address public tokenRegistryAddress;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    modifier onlyVoteManager() {
        require(
            msg.sender == voteManagerAddress,
            "Only vote manager can call this function."
        );
        _;
    }

    modifier onlyTokenRegistryOrOwner() {
        require(
            msg.sender == tokenRegistryAddress || owner() == _msgSender(),
            "Only the token registry or owner can call this function."
        );
        _;
    }

    function updateTokenRegistryAddress(
        address _tokenRegistryAddress
    ) external onlyOwner {
        tokenRegistryAddress = _tokenRegistryAddress;
    }

    function updateVoterManagerAddress(
        address _voteManagerAddress
    ) external onlyTokenRegistryOrOwner {
        voteManagerAddress = _voteManagerAddress;
    }

    function mint(address to, uint256 amount) public onlyVoteManager {
        _mint(to, amount);
    }
}
