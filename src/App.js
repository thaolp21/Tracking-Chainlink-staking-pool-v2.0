import './App.css';
import { Network, Alchemy } from 'alchemy-sdk';
import { createAlchemyWeb3 } from '@alch/alchemy-web3'
import ctABI from './contract-abi.json'
import { useEffect, useState } from 'react';

const API_URL_ETH_SEPOLIA = "wss://eth-sepolia.g.alchemy.com/v2/mke1U-smGOrgpPpAjVJcAFp5_WPRpOn5"
const API_URL_ETH_MAINNET = "wss://eth-mainnet.g.alchemy.com/v2/mke1U-smGOrgpPpAjVJcAFp5_WPRpOn5"
const CHAINLINK_STAKING_CONTRACT_ADDRESS = "0xBc10f2E862ED4502144c7d632a3459F49DFCDB5e"
const contractABI = ctABI
const web3 = createAlchemyWeb3(API_URL_ETH_MAINNET)

function App() {
  const [maxAmount, setMaxAmount] = useState(0)
  const [currentAmountStaked, setCurrentAmountStaked] = useState(0)
  const [status, setStatus] = useState('')

  const chainlinkStakingPoolContract = new web3.eth.Contract(ctABI, CHAINLINK_STAKING_CONTRACT_ADDRESS)
  function calculateAmount(amount) {
    return (amount / 1e18).toFixed(0)
  }
  function checkPoolChanged() {
    chainlinkStakingPoolContract.events.Unstaked({}, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
        setStatus('unStaked')
      }
    })
  }
  useEffect(() => {
    async function fetchData() {
      const maxPoolSize = await chainlinkStakingPoolContract.methods.getMaxPoolSize().call()
      const totalAmountStaked = await chainlinkStakingPoolContract.methods.getTotalPrincipal().call()
      setMaxAmount(calculateAmount(maxPoolSize))
      setCurrentAmountStaked(calculateAmount(totalAmountStaked))
    }
    fetchData()
    checkPoolChanged()
  }, [currentAmountStaked, status])

  return (
    <div className="App">
      <div>
        <p>The the maximum amount that can be staked in the pool: {maxAmount}</p>
        <p>The total amount staked in pool: {currentAmountStaked}</p>
        <p>The remaining slot amounts
          : {maxAmount - currentAmountStaked}</p>
        <p>status: {status}</p>
      </div>
    </div>
  );
}

export default App;
