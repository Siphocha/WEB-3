//SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

//calling it cryptodevs an making it ERC721enumerable and potentially owned by others "Ownable"
contract CryptoDevs is ERC721Enumerable, Ownable{
    // _baseTokenURI for computing tokens as objects {}.If set token will be merger of baseURI and tokenId.
    string _baseTokenURI;

    // _price is price of one cryptodev NFT
    uint256 public _price = 0.01 ether;

    // _paused is used to pause contract incase of emergency
    bool public _paused;

    //max number of CryptoDevs
    uint256 public maxTokenIds = 20;

    //total number of tokenIds minted
    uint256 public tokenIds;

    //whitelist contract instance 
    IWhitelist whitelist;

    //boolean to keep track of whether presale started or not
    bool public presaleStarted;

    //timesstamp  for when presale would end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused{
        require(!_paused, "Contract currently paused");
        _;
    }
    // * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
    // * name in our case is `Crypto Devs` and symbol is `CD`.
    // * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection.
    //* It also initializes an instance of whitelist interface.
    constructor (string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD"){
        _baseTokenURI =  baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    //starts presale for whitelisted addresses
    function startPresale() public onlyOwner{
        presaleStarted = true;
        //set presaleEnded time as current timestamp+5 minutes
        presaleEnded = block.timestamp + 5 minutes;
    }

    //presaleMint allows user to mint one NFT per transaction during presale
    function presaleMint() public payable onlyWhenNotPaused{
        require(presaleStarted && block.timestamp < presaleEnded, "presale is over");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
        require(tokenIds < maxTokenIds, "Exceed maximum crypto devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;

        //_safeMint is safer version of _mint function. 
        //works more smartly and situationally.
        _safeMint(msg.sender, tokenIds);
    }

    //allows users to mint 1 NFT transaction after presale ended.
    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >=  presaleEnded, "Presale has not ended yet");
        require(tokenIds < maxTokenIds, "Exceed maximum Crypto Devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // _baseURI overrides OpenZeppelin's ERC721 implementation.
    function _baseURI() internal view virtual override returns(string memory){
        return _baseTokenURI;
    }

    // setPaused makes contract paused or unpaused
    function setPaused(bool val) public onlyOwner{
        _paused = val;
    }

    //widhtraw sends all ether in contract to the owner of the contrac
    function withdraw() public onlyOwner{
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    //function to recieve Ether.msg.data must be empty
    receive() external payable {}

    //Fallback function is called when msg.data is not empty
    fallback() external payable {}
}