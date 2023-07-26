pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

//Interfaces go here and not in the contract itself.
    //Interface for contract. Will be callig info from previous iCO project contracts too.
    interface IFakeNFTMarketplace{
        function getPrice() external view returns(uint256);
        function available(uint256 _tokenId) external view returns(bool);
        function purchase(uint256  _tokenId) external payable;
    }

    //minimal interface for fake martketplace
    interface ICryptoDevsNFT{
        //function for fetching and returning number of NFT's address owns.
        function balanceOf(address owner) external view returns (uint256);
        //returns tokenId at index for owner so they know its their NFT.
        function tokenOfOwnerByIndex(address owner, uint256 index)
            external
            view
            returns(uint256);
    }

contract CryptoDevsDAO is Ownable{

    //Create a struct named "Proposal" containing all relevant info
    struct Proposal{
        //tokenID of NFT to purchase if proposal/vote has passed
        uint256 nftTokenId;
        //deadline - UNIX timestamp until which the proposal is active. Can still be executed when proposal has passed but hv different result.
        uint256 deadline;
        //yayVotes - number of yay votes for this proposal
        uint256 yayVotes;
        //nayVotes - number of nay votes for this proposal
        uint256 nayVotes;
        //executed - whether or not this proposal has been executed. cannot be so before deadline has passed.
        bool executed;
        //voters - a mapping of CryptoDevsNFT tokenIDs to booleans indicating whether that NFT has already been used to cast a vote.
        mapping(uint256 => bool) voters;
    }

    //mapping to hold all proposals. mapping ID to proposal.
    mapping(uint256 => Proposal) public proposals;
    //Number of proposals that have been created
    uint256 public numProposals;

    //Initialising functions from FakeNFTMarketplace and ICryptoDevsNFT
    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;

    //constructor function to initialise contracts as stated above.
    //will also accept an ETH deposit from deployer to fill DAO ETH treasury.
    constructor(address _nftMarketplace, address _cryptoDevsNFT) payable{
        nftMarketplace = IFakeNFTMarketplace(_nftMarketplace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    //allows functions to only be used by people who own an NFT from CryptoDevs NFT contract
    modifier nftHolderOnly(){
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }

    //createProposal function allows members to create new proposals.
    function createProposal(uint256 _nftTokenId)
        external
        nftHolderOnly
        returns (uint256){
            require(nftMarketplace.available(_nftTokenId), "NFT_NOT_FOR_SALE");
            Proposal storage proposal = proposals[numProposals];
            proposal.nftTokenId = _nftTokenId;
            //sets proposals voting deadline to be current time +5 minutes
            proposal.deadline = block.timestamp + 5 minutes;

            numProposals++;

            return numProposals - 1;
        }

    //modifier that allows a function be called if before deadline.
    modifier activeProposalOnly(uint256 proposalIndex){
        require(proposals[proposalIndex].deadline > block.timestamp, "DEADLINE_EXCEEDED");
        _;
    }

    //enum for voting. Yay==0. Nay=1
    enum Vote {
        YAY, 
        NAY
    }
    
    //"voteOnProposal" function that allows to vote.
    function voteOnProposal(uint256 proposalIndex, Vote vote)
        external
        nftHolderOnly
        activeProposalOnly(proposalIndex){
            Proposal storage proposal = proposals[proposalIndex];
            
            uint256 voterNFTBalance = cryptoDevsNFT.balanceOf(msg.sender);
            uint256 numVotes = 0;

            //calculate how many NFTs are owned by voter. that havent already bene used for voting on this proposal.
            for(uint256 i = 0; i < voterNFTBalance; i++){
                uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
                if (proposal.voters[tokenId] == false){
                    numVotes++;
                    proposal.voters[tokenId] = true;
                }
            }
           require(numVotes > 0, "ALREADY_VOTED");

           if(vote == Vote.YAY){
               proposal.yayVotes += numVotes;
           } 
           else{
               proposal.nayVotes += numVotes;
           }
        }

    //modifier. To execute proposal whose deadline has exceeded.
    modifier inactiveProposalOnly(uint256 proposalIndex){
        require(proposals[proposalIndex].deadline <= block.timestamp, "DEADLINE_NOT_EXCEEDED");
        require(proposals[proposalIndex].executed == false, "PROPOSAL_ALREADY_EXECUTED");
        _;
    }

    //function for executing proposal
    function executeProposal(uint256 proposalIndex)
        external
        nftHolderOnly
        inactiveProposalOnly(proposalIndex){
            Proposal storage proposal = proposals[proposalIndex];

            //if more YAY than NAY then purchase NFT from FakeNFTMarketplace
            if(proposal.yayVotes > proposal.nayVotes){
                uint256 nftPrice = nftMarketplace.getPrice();
                require(address(this).balance >= nftPrice, "NOT_ENOUGH_FUNDS");
                nftMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
            }
            proposal.executed = true;
        }

    //lets ContractOwner withdraw ETH using modifier
    function withdrawEther() external onlyOwner{
        payable(owner()).transfer(address(this).balance);
    }

    //function for normal users to deposit ETh directly and retrieve.
    receive() external payable {}
    fallback() external payable {}
}