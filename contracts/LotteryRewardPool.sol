pragma solidity 0.6.12;

import '@pieswap/pie-swap-lib/contracts/token/OIP20/IOIP20.sol';
import '@pieswap/pie-swap-lib/contracts/token/OIP20/SafeOIP20.sol';
import '@pieswap/pie-swap-lib/contracts/access/Ownable.sol';

import './MasterChef.sol';

contract LotteryRewardPool is Ownable {
    using SafeOIP20 for IOIP20;

    MasterChef public chef;
    address public adminAddress;
    address public receiver;
    IOIP20 public lptoken;
    IOIP20 public pie;

    constructor(
        MasterChef _chef,
        IOIP20 _pie,
        address _admin,
        address _receiver
    ) public {
        chef = _chef;
        pie = _pie;
        adminAddress = _admin;
        receiver = _receiver;
    }

    event StartFarming(address indexed user, uint256 indexed pid);
    event Harvest(address indexed user, uint256 indexed pid);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == adminAddress, "admin: wut?");
        _;
    }

    function startFarming(uint256 _pid, IOIP20 _lptoken, uint256 _amount) external onlyAdmin {
        _lptoken.safeApprove(address(chef), _amount);
        chef.deposit(_pid, _amount);
        emit StartFarming(msg.sender, _pid);
    }

    function  harvest(uint256 _pid) external onlyAdmin {
        chef.deposit(_pid, 0);
        uint256 balance = pie.balanceOf(address(this));
        pie.safeTransfer(receiver, balance);
        emit Harvest(msg.sender, _pid);
    }

    function setReceiver(address _receiver) external onlyAdmin {
        receiver = _receiver;
    }

    function  pendingReward(uint256 _pid) external view returns (uint256) {
        return chef.pendingPie(_pid, address(this));
    }

    // EMERGENCY ONLY.
    function emergencyWithdraw(IOIP20 _token, uint256 _amount) external onlyOwner {
        pie.safeTransfer(address(msg.sender), _amount);
        emit EmergencyWithdraw(msg.sender, _amount);
    }

    function setAdmin(address _admin) external onlyOwner {
        adminAddress = _admin;
    }

}
