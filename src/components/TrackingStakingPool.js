import { createAlchemyWeb3 } from '@alch/alchemy-web3'
import contractABI from '../contract-abi.json'
import { useEffect, useState } from 'react';

import React from 'react';

const API_URL_ETH_SEPOLIA = "wss://eth-sepolia.g.alchemy.com/v2/mke1U-smGOrgpPpAjVJcAFp5_WPRpOn5"
const API_URL_ETH_MAINNET = "wss://eth-mainnet.g.alchemy.com/v2/mke1U-smGOrgpPpAjVJcAFp5_WPRpOn5"
const CHAINLINK_STAKING_CONTRACT_ADDRESS = "0xBc10f2E862ED4502144c7d632a3459F49DFCDB5e"
const web3 = createAlchemyWeb3(API_URL_ETH_MAINNET)

const TrackingStakingPool = () => {
    const [maxAmount, setMaxAmount] = useState(0)
  const [currentAmountStaked, setCurrentAmountStaked] = useState(0)
  const [status, setStatus] = useState('nothing changes')

  const chainlinkStakingPoolContract = new web3.eth.Contract(contractABI, CHAINLINK_STAKING_CONTRACT_ADDRESS)
  function calculateAmount(amount) {
    return (amount / 1e18).toFixed(0)
  }
  function listenSmartContractEvent(eventName) {
    chainlinkStakingPoolContract.events[eventName]({}, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log(data.returnValues);
        // returnValues: [address staker, uint256 amount, uint256 newStake, uint256 newTotalPrincipal]
        const amount = calculateAmount(data.returnValues[1])
        const newTotalPrincipal = calculateAmount(data.returnValues[3])
        setCurrentAmountStaked(newTotalPrincipal)
        setStatus(`${eventName}: ${amount}`)
        sendNotification(newTotalPrincipal)
      }
    })
  }
  
  function hasPermission() {
    return ("Notification" in window) && (Notification.permission === 'granted')
  }
  function sendNotification(amount) {
    if(hasPermission) {
      new Notification("Tracking Chainlink Staking Pool V2.0", {
        body: "The remaining slot amounts" + (maxAmount - amount),
      });
    }
  }
  function checkPoolChanged() {
   listenSmartContractEvent('Unstaked')
   listenSmartContractEvent('Staked')
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
  }, [])

  return (
    <div >
      <div>
        <p>The the maximum amount that can be staked in the pool: {maxAmount}</p>
        <p>The total amount staked in pool: {currentAmountStaked}</p>
        <p>The remaining slot amounts
          : {maxAmount - currentAmountStaked}</p>
        <p>status: {status}</p>
      </div>
    </div>
  );
};

export default TrackingStakingPool;