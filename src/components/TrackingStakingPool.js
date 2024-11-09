import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import contractABI from "../contract-abi.json";
import { useEffect, useState } from "react";

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
  const [grantedPermission, setGrantedPermission] = useState(
    Notification?.permission === "granted"
  );
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

  function sendNotification(amount) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Tracking Chainlink Staking Pool V2.0", {
        body: `Remaining allotment: ${convertToLocaleString(amount)}`,
      });
    }
  }

  function sendTelegramNotification(
    status,
    amount,
    newTotalPrincipal,
    remainAmount
  ) {
    try {
      axios
        .post(
          `${baseUrlBotTelegram}/sendMessage`,
          {
            chat_id: teleChatIdTest,
            text: `Someone has just ${status.toLowerCase()}: ${convertToLocaleString(
              amount
            )} LINK. The current amounts staked in the pool ${convertToLocaleString(
              newTotalPrincipal
            )} LINK. Remaining allotment: ${convertToLocaleString(
              remainAmount
            )} LINK`,
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
      console.log("sendNoti");

      const { eventName, amount } = dataEvent;
      const amountChanged = calculateAmount(amount);

      setStatus(`${eventName}: ${amountChanged}`);

      if (remainAllotment) {
        sendNotification(remainAllotment);
        sendTelegramNotification(
          eventName,
          amountChanged,
          principalInteger,
          remainAllotment
        );
      }
    }
  }
  function fakeEvent() {
    const principal = 40874000 * 1e18;
    const amount = 1000 * 1e18;
    setStateAndSendNotification(principal, { eventName: "Unstaked", amount });
  }
  function listenSmartContractEvent(eventName) {
    chainlinkStakingPoolContract.events[eventName]({}, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        // returnValues: [address staker, uint256 amount, uint256 newStake, uint256 newTotalPrincipal]

        const { amount, newTotalPrincipal } = data.returnValues;
        console.log(data);
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

  return (
    <div>
      <p>
        The the maximum amount that can be staked in the pool:{" "}
        {convertToLocaleString(maxAmount)}
      </p>
      <p>
        The total amount staked in the pool:{" "}
        {convertToLocaleString(currentAmountStaked)}
      </p>
      <p>The remaining slot amounts : {convertToLocaleString(remainAmount)}</p>
      <p>status: {status}</p>
      <button onClick={fakeEvent}>trigger event smart contract</button>
    </div>
  );
};

export default TrackingStakingPool;
