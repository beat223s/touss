const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('../scripts/whitelist.js')

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
import { config } from '../dapp.config'
import { ethers } from 'ethers'

const contract = require('../artifacts/contracts/BattleSlayers.sol/ThePurge.json')
const nftContract = new web3.eth.Contract(contract.abi, config.contractAddress)

// Calculate merkle root from the whitelist array
const leafNodes = whitelist.map((addr) => keccak256(addr))
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const root = '0x' + merkleTree.getRoot().toString('hex');

export const getTotalMinted = async () => {
  const totalMinted = await nftContract.methods.totalSupply().call()
  return totalMinted
}

export const getMaxSupply = async () => {
  const maxSupply = await nftContract.methods.maxSupply().call()
  return maxSupply
}

export const isPausedState = async () => {
  const paused = await nftContract.methods.paused().call()
  return paused
}

export const isPublicSaleState = async () => {
  const publicSale = await nftContract.methods.publicM().call()
  return publicSale
}

export const isPreSaleState = async () => {
  const preSale = await nftContract.methods.presaleM().call()
  return preSale
}

export const getPrice = async () => {
  const price = await nftContract.methods.price().call()
  return price
}

export const presaleMint = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const leaf = keccak256(window.ethereum.selectedAddress)
  const proof = merkleTree.getHexProof(leaf)

  // Verify Merkle Proof
  const isValid = merkleTree.verify(proof, leaf, root)

  if (!isValid) {
    return {
      success: false,
      status: 'You are not on WL'
    }
  }

  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signer = provider.getSigner()
  const nft_contract = new ethers.Contract(config.contractAddress, contract.abi, signer);
  let userAddress = await signer.getAddress()
  //const priceWei = parseInt(await nft_contract.cost());
  const walletMint = parseInt(await nft_contract.WalletMint(userAddress));
  const free = parseInt(await nft_contract.freeMint());
  console.log(mintAmount);
  if (walletMint < free) {
    console.log("free"+free);
    //const totalMintCost = ethers.BigNumber.from(config.price).mul(mintAmount-free);
    const totalMintCost = parseInt(
      web3.utils.toWei(String(config.price * (mintAmount-free), 'ether')))
    console.log("Cost"+totalMintCost);
    //const gasLimit = await nft_contract.estimateGas.presaleMint(window.ethereum.selectedAddress,mintAmount, proof,{value:totalMintCost});
    //const newGasLimit = parseInt((gasLimit *1.2)).toString();
    //const tx = await nft_contract.ogMint(window.ethereum.selectedAddress,mintAmount, proof, {value:totalMintCost,gasLimit : newGasLimit})
    const tx = {
      to: config.contractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * (mintAmount-free), 'ether'))
      ).toString(16), // hex
      data: nftContract.methods
        .presaleMint(window.ethereum.selectedAddress, mintAmount, proof)
        .encodeABI(),
      nonce: nonce.toString(16)
    }
    try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
      return {
        success: true,
        status: (
          <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank">
            <p>✅ Check out your transaction on goerli.etherscan:</p>
            <p>{`https://goerli.etherscan.io/tx/${txHash}`}</p>
          </a>
        )
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }
} else {
  const totalMintCost = parseInt(
    web3.utils.toWei(String(config.price * mintAmount, 'ether')))
  console.log("Cost"+totalMintCost);
    //const gasLimit = await nft_contract.estimateGas.presaleMint(window.ethereum.selectedAddress,mintAmount, proof,{value:totalMintCost});
    //const newGasLimit = parseInt((gasLimit *1.2)).toString();
    //const tx = await nft_contract.ogMint(window.ethereum.selectedAddress,mintAmount, proof, {value:totalMintCost,gasLimit : newGasLimit}) 
    const tx = {
      to: config.contractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * (mintAmount), 'ether'))
      ).toString(16), // hex
      data: nftContract.methods
        .presaleMint(window.ethereum.selectedAddress, mintAmount, proof)
        .encodeABI(),
      nonce: nonce.toString(16)
    }
    try {
    // await tx.wait()
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })  
    return {
      success: true,
      status: (
        <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank">
          <p>✅ Check out your transaction on goerli.etherscan:</p>
          <p>{`https://goerli.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }
}
}

export const publicMint = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )

  // Set up our Ethereum transaction
  const tx = {
    to: config.contractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * mintAmount), 'ether')
    ).toString(16), // hex
    data: nftContract.methods
    .publicSaleMint(mintAmount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: (
        <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank">
          <p>✅ Check out your transaction on goerli.etherscan:</p>
          <p>{`https://goerli.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }
}
