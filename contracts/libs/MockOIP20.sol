pragma solidity 0.6.12;

import "@pieswap/pie-swap-lib/contracts/token/OIP20/OIP20.sol";

contract MockOIP20 is OIP20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public OIP20(name, symbol) {
        _mint(msg.sender, supply);

    }
}
