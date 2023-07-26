pragma solidity ^0.8.0;

contract FakeNFTMarketplace{
    //Maintain mapping of fake tokenID to then owners address
    mapping(uint256 => address) public tokens;
    //set purchase price for each fake NFT
    uint256 nftPrice = 0.1 ether;

    //"purchase()" accepts ETH of buyer and marks owner of the tokenID the caller address (so you know it's sold).
    function purchase(uint256 _tokenId) external payable{ 
        require(msg.value == nftPrice, "This NFT costs 0.1 ether");
        tokens[_tokenId] = msg.sender;
    }

    //"getPrice()" returns the price of one NFT
    function getPrice() external view returns (uint256){
        return nftPrice;
    }

    //"available()" cehcks if tokenId sold or not.
    //_tokenId- check for this one.
    function available(uint256 _tokenId) external view returns (bool){
        //default value for addresses in Solidity
        if (tokens[_tokenId] == address(0)){
            return true;
        }
        return false;
    }
}