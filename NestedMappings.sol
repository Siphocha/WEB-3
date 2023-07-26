//Nested Mappings
//"key" points to second mapping. We set "valuetype" to mapping itself.

pragma solidity ^0.8.10;

contract NestedMappings{
    //Mapping from address => (mapping from uint to bool)
    mapping(address => mapping(uint => bool)) public nestedMap;

    function get(address _addr1, uint _i) public view returns (bool){
        //get value from nested mapping
        //default value for bool type is false
        return nestedMap[_addr1][_i];
    }

    function set(
        address _addr1,
        uint _i,
        bool _boo
    ) public{
        nestedMap[_addr1][_i] = _boo;
    }

    function remove(address _addr1, uint _i) public{
        delete nestedMap[_addr1][_i];
    }
}

