const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS,  METADATA_URL} = require("../constants");

async function main(){
    //Address to whitelist contract deployed for whitelistDapp
    const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
    //URL from where we can extract metadata for a Crypto Dev NFT
    const metadataURL = METADATA_URL;

    //ContractFactory in ethers.js is used to deploy new smart contracts
    const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

    //deploy contract
    const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
        metadataURL,
        whitelistContract
    );

    //print the address of deployed contract
    console.log(
        "CryptoDevs Contract Address",
        deployedCryptoDevsContract.address
    );
}

//call main function and catch if theres an error
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1)
    })