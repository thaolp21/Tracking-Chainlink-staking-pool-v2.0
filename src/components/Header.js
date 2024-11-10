import React, { useState } from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const Header = () => {
  const [grantedPermission, setGrantedPermission] = useState(
    Notification?.permission === "granted"
  );

  function askNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notification");
      return;
    }
    Notification.requestPermission().then((permission) => {
      setGrantedPermission(permission === "granted");
    });
  }
  return (
    <Box component="section" sx={{
      p: 2, bgcolor: '#f2f2f2', textAlign: 'right',
      boxShadow: 2,
      borderRadius: 2,
    }}>
      <Button variant="outlined" onClick={askNotificationPermission} disabled={grantedPermission}>Enable notifications</Button>
    </Box>
  );
};

export default Header;
