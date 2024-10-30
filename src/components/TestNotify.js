import React, { useState } from "react";

const TestNotify = () => {
  const [numOfNoti, setNumOfNoti] = useState(0);
  const [grantedPermission, setGrantedPermission] = useState(
    Notification?.permission === "granted"
  );
  function createNotification(val) {
    const notificationObj = new Notification("Tracking Chainlink Staking Pool V2.0", {
        body: "You are in Test Nofity page!" + val,
      });
      // notificationObj.onclick((noti,e) => {
      //   window.location.href = 'http://localhost:3000/'
      // })
    return notificationObj
  }
  
  function askNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notification");
      return;
    }
    Notification.requestPermission().then((permission) => {
      setGrantedPermission(permission === "granted");
    });
  }
  function checkLogic() {
    setNumOfNoti(numOfNoti + 1);
    if (numOfNoti > 5) {
      createNotification(numOfNoti);
    }
  }
  return (
    <div>
      <p>{numOfNoti}</p>
      <button onClick={checkLogic}>Action Notification</button>
      <button onClick={() => setNumOfNoti(0)}>Reset</button>
      <button onClick={askNotificationPermission} disabled={grantedPermission}>
        Enable notifications
      </button>
    </div>
  );
};

export default TestNotify;
