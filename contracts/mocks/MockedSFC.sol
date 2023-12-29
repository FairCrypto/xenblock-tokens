pragma solidity ^0.8.20;

// SPDX-License-Identifier: mit

import "../interfaces/SFC.sol";

// for testing purposes only

contract MockedSFC is SFC {
    function updateCurrentSealedEpoch(uint256 epoch) public {
        currentSealedEpoch = epoch;
    }

    function addValidatorID(address addr, uint256 id) public {
        getValidatorID[addr] = id;
        getEpochSnapshot[currentSealedEpoch].validatorIDs.push(id);
    }
}
