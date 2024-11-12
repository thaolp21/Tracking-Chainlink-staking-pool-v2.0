import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import contractABI from "../contract-abi.json";
import { useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import React from "react";
import axios from "axios";
const API_URL_ETH_SEPOLIA =
  "wss://eth-sepolia.g.alchemy.com/v2/mke1U-smGOrgpPpAjVJcAFp5_WPRpOn5";
const API_URL_ETH_MAINNET =
  "wss://eth-mainnet.g.alchemy.com/v2/mke1U-smGOrgpPpAjVJcAFp5_WPRpOn5";
const CHAINLINK_STAKING_CONTRACT_ADDRESS =
  "0xBc10f2E862ED4502144c7d632a3459F49DFCDB5e";
const web3 = createAlchemyWeb3(API_URL_ETH_MAINNET);

const baseUrlBotTelegram =
  "https://api.telegram.org/bot7936917115:AAFj5ibbT9fnrfDpZs5YBWhjV_J6zOCKdEQ";
const teleChatIdTest = "1614996255";
const teleChatChannel = "@chainlink_staking_pool";

const TrackingStakingPool = () => {
  const [maxAmount, setMaxAmount] = useState(40875000);
  const [currentAmountStaked, setCurrentAmountStaked] = useState(0);
  const [remainAmount, setRemainAmount] = useState(0);
  const [status, setStatus] = useState("nothing changes");
  const chainlinkStakingPoolContract = new web3.eth.Contract(
    contractABI,
    CHAINLINK_STAKING_CONTRACT_ADDRESS
  );

  function calculateAmount(amount) {
    return (amount / 1e18).toFixed(0);
  }

  function convertToLocaleString(num) {
    return Number(num).toLocaleString();
  }

  function calcRemainAmount(currAmount) {
    return (maxAmount - currAmount).toFixed(0);
  }

  function sendNotification(newTotalPrincipal, remainAmount) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Tracking Chainlink Staking Pool V2.0", {
        body: `Amounts in the pool: ${convertToLocaleString(
          newTotalPrincipal
        )} LINK.\nRemain allotment: ${convertToLocaleString(
          remainAmount
        )} LINK.`,
      });
    }
  }

  function sendTelegramNotification(
    newTotalPrincipal,
    remainAmount
  ) {
    try {
      axios
        .post(
          `${baseUrlBotTelegram}/sendMessage`,
          {
            chat_id: teleChatChannel,
            text: `Amounts in the pool: ${convertToLocaleString(
              newTotalPrincipal
            )} LINK.\nRemain allotment: ${convertToLocaleString(
              remainAmount
            )} LINK.`,
            disable_notification: true,
          },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        )
        .then();
    } catch (error) {
      alert(error.message);
    }
  }

  function setStateAndSendNotification(principal, dataEvent) {
    const principalInteger = calculateAmount(principal);
    const remainAllotment = calcRemainAmount(principalInteger);

    setCurrentAmountStaked(principalInteger);
    setRemainAmount(remainAllotment);

    if (dataEvent) {
      const { eventName, amount } = dataEvent;
      const amountChanged = calculateAmount(amount);

      setStatus(`${eventName}: ${amountChanged}`);

      if (remainAllotment) {
        sendNotification(
          principalInteger,
          remainAllotment
        );
        sendTelegramNotification(
          principalInteger,
          remainAllotment
        );
      }
    }
  }
  function listenSmartContractEvent(eventName) {
    chainlinkStakingPoolContract.events[eventName]({}, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        // returnValues: [address staker, uint256 amount, uint256 newStake, uint256 newTotalPrincipal]

        const { amount, newTotalPrincipal } = data.returnValues;
        setStateAndSendNotification(newTotalPrincipal, { eventName, amount });
      }
    });
  }

  /* 
  #TODO: Handle case NotificationPermission === "denied" or permission is blocked
   Handle Notification:
    Defined: [rnpr] request-noti-permission-range (button askPermission + warning text + instruction to turn on notification in browser)
    1. First render: checkPermission ? (hide rnpr) : (display rnpr)
    2. If user denied -> display rnpr, if yes -> hide rnpr
    [Optional] 3. Handle onclick in notification of browser
    --Noted-- askPermission must be in a user gesture (mean clicking or tabbing a button)
  */

  /* #TODO: Implement wallet -> tracking amount and total pricipal of this wallet or need a input to take an address and tracking this one
   */

  /* #TODO: Style UI
   */

  function checkPoolChanged() {
    listenSmartContractEvent("Unstaked");
    listenSmartContractEvent("Staked");
  }

  useEffect(() => {
    async function fetchData() {
      const maxPoolSize = await chainlinkStakingPoolContract.methods
        .getMaxPoolSize()
        .call();
      const totalAmountStaked = await chainlinkStakingPoolContract.methods
        .getTotalPrincipal()
        .call();

      setMaxAmount(calculateAmount(maxPoolSize));
      setStateAndSendNotification(totalAmountStaked);
    }
    fetchData();
    checkPoolChanged();
  }, []);
  const content = (data) => {
    return <Typography sx={{ p: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>
      {(data * 1) ? convertToLocaleString(data) : data}
    </Typography>
  };
  return (

    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h4" component="div" sx={{ p: 2 }}>
          Chainlink staking pool V2.0
        </Typography>
        <Divider textAlign="left">POOL SIZE</Divider>
        {content(maxAmount)}
        <Divider textAlign="left">CURRENT STAKED</Divider>
        {content(currentAmountStaked)}
        <Divider textAlign="left">REMAIN ALLOTMENT</Divider>
        {content(remainAmount)}
        <Divider textAlign="right">STATUS</Divider>
        {content(status)}
      </CardContent>
    </Card >

  );
};

export default TrackingStakingPool;
