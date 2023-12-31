//Mappings act as Hashmaps/dictionaries in solidity
pragma solidity ^0.8.10;

contract Mapping{
    //Mapping from address to uint
    mapping(address => uint) public myMap;

    function get(address _addr) public view returns (uint){
        //Mapping always returns a value
        //If value never set returns default (0)
        return myMap[_addr];
    }

    function set(address _addr, uint _i) public{
        //Update value at this address
        myMap[_addr] = _i;
    }

    function remove(address _addr) public{
        //reset value to default value.
        delete myMap[_addr];
    }
}

