require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;

const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/XNrf40yI-d9i706uCbTVCsVTe7z0z_Xq",
      accounts: ["ec55b06cd858f99edea0ab91611d26f2fd0c83322fd5f61e6fcbf46f3c24480f"],
    },
  },
};
