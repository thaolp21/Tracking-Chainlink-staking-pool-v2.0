import React, { useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export const STATUS = {
  GRANTED: "granted",
  DEFAULT: "default",
  DENIED: "denied",
};

const Header = () => {
  const [grantedPermission, setGrantedPermission] = useState(
    Notification?.permission === STATUS.GRANTED
  );

  function askNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notification");
      return;
    }

    Notification.requestPermission().then((permission) => {
      console.log(Notification.permission);
      setGrantedPermission(permission === STATUS.GRANTED);
    });
  }
  return (
    <Box
      component="section"
      sx={{
        p: 2,
        bgcolor: "#f2f2f2",
        color: "red",
        boxShadow: 2,
        borderRadius: 2,
        display: "flex",
        flexWrap: "wrap"
      }}
    >
      <Button
        variant="outlined"
        onClick={askNotificationPermission}
        disabled={grantedPermission}        
      >
        Enable notifications
      </Button>
      {Notification?.permission === STATUS.DENIED && (
        <Box sx={{fontSize: "14px" , fontStyle: "italic", pt: "0.5rem"}}>
          
          Your browser is denying/blocking notification permission. Please allow
          notification permission to receive the latest notification.
        </Box>
      )}
    </Box>
  );
};

export default Header;
