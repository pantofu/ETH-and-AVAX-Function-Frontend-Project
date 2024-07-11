// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;
    bool public isLocked;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event BalanceReset();
    event ContractLocked();
    event ContractUnlocked();

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        isLocked = false;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    modifier whenNotLocked() {
        require(!isLocked, "Contract is locked");
        _;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }
    //resets the current balance to 0
    function resetBalance() public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _currentBalance = balance;
        if (_currentBalance == 0) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: 0
            });
        }
        balance = 0;
        emit Withdraw(_currentBalance);
        emit BalanceReset();
    }

    //locks the account and no transaction can through
    function lock() public onlyOwner {
        isLocked = true;
        emit ContractLocked();
    }

    //opens the account 
    function unlock() public onlyOwner {
        isLocked = false;
        emit ContractUnlocked();
    }

}
