import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home(){
  //Create BigNumber "0"
  const zero = BigNumber.from(0)
  //will keep track if wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  //loading is set to true when waiting for minting of coin
  const [loading, setLoading] = useState(false);
  //tokensToBeClaimed keeps track of num of tokens claimed
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  //balanceOfCryptoDevTokens keeps track of num of Crypto Dev tokens owned by address
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(zero);
  //amount of tokens the user wants to mint
  const [tokenAmount, setTokenAmount] =useState(zero);
  //tokensMinted is total amount of tokens minted till now out of 10,000 of max-total-supply
  const [tokensMinted, setTokensMinted] = useState(zero);
  //Create reference to Web3Modal used for connecting to metamask
  const web3ModalRef = useRef();

  //function for defining the provider and signer.
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  //this function checks the amount of tokens left that can be claimed by user
  const getTokensToBeClaimed = async() =>{
    try{
      //gets provider (metamask)
      //dont need signer as only reading
      const provider = await  getProviderOrSigner();
      //create instance of NFT Contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      //create an instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      //get signer here to extract address of then current meta mask
      const signer = await getProviderOrSigner(true);
      //get the address associated to signer (webdapp's owner or owner of that thing)
      const address = await signer.getAddress();
      //call balanceOf from NFT contract to get number of NFT's
      const balance = await nftContract.balanceOf(address);
      //balance is a big number and thus we would compare it with Big number 0.
      if (balance === zero){
        setTokensToBeClaimed(zero);
      }
      else{
        //amount keeps track of number of unclaimed tokens
        var amount = 0;
        //this loop for all NFT's if theyve been claimed
        //only increase amount if tokens have not been claimed. (tokenId)
        for (var i = 0; i < balance; i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);

          if (!claimed){
            amount++;
          }
        }
        //tokensToBeClaimed has been initalised as a Big Number
        //so we convert amount to big number first.
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch(err){
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };

  //getBalanceOfCryptoDevTokens. checks amount of tokens available.
  const getBalanceOfCryptoDevTokens = async () =>{
    try{
      //get provider from metamask
      //only reading. so provider.
      const provider = await getProviderOrSigner();
      //create instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      //get signer now to extract address of current metamask account
      const signer = await getProviderOrSigner(true);
      //get address associated to signer (its on metamask)
      const balance = await tokenContract.balanceOf(address);
      //balance will be a "Big Number" so need to convert
      setBalanceOfCryptoDevTokens(balance);
    } catch(err){
      console.error(err);
      setBalanceOfCryptoDevTokens(zero);
    }
  };

  const getTotalTokensMinted = async () =>{
    try{
      //get provider
      const provider = await getProviderOrSigner();
      //create instanec of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      //get all tokens that haev been minted
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch(err){
      console.log(err);
    }
  };
    
  //mintCryptoDevToken: mints `amount` number of tokens to a given address
  const mintCryptoDevToken = async(amount) => {
    try{
      //need signer since we need to write now.
      //create instance of tokenContract
      const signer = await getProviderOrSigner(true);
      //create instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      
      //Each token is "0.001 ether" value needed is "0.001" amount
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        //value signifies cost of one Crypto Dev token.
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      //wait for transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("Successfully mined Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err){
      console.error(err);
    }
  };

  const claimCryptoDevTokens = async () =>{
    try{
      //we need signer here since its "write"
      //create instance of tokenContract
      const signer = await getProviderOrSigner(true);
      //create instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      //wait for transation to get mined
      await tx.wait();
      setLoading(false);
      window.alert("Successfully claimed Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch(err){
      console.error(err);
    }
  };

  const connectWallet = async () =>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch(err){
      console.log(err);
    }
  };

  //now going to "useEffect" to react to all changes on the website.
  useEffect(() => {
    //if wallet is not connected
    if (!walletConnected){
      //assign web3modal class to reference  object by setting its "current" value
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);

  //renderButton will returns button based on state of the dapp.
  const renderButton = () =>{
    //If we waiting for something return loaing button
    if (loading){
      return(
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    //If tokens to be claimed are greater than 0, return a claim button
    if(tokensToBeClaimed > 0){
      return(
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    //If user doesnt have any tokens to claim, show the mint button
    return(
      <div style={{ display: "flex-col" }}>
        <div>
          <input
          type="number"
          placeholder="amount of tokens"
          //BigNumber.from converts the e.target.value to a Big Number
          onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          className={styles.input}/>
        </div>
        <button 
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}> Mint Tokens</button>
      </div>
    );
  };

  //This is the actual page design.
  return(
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/*Forma ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)}
                Crypto Dev Tokens
              </div>
              <div className={styles.description}>
                {/*Format ether helps us in converting BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/1000 have been minted!
              </div>
              {renderButton()}
            </div>
          ) : ( 
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg"/>
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}