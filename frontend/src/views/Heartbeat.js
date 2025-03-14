import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import axios from "axios";

// const Heartbeat = () => {
//   const history = useHistory();
//   const location = useLocation();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     let heartbeatInterval;
//     let lastActivityTime = Date.now();
//     // let isSessionExpired = false;

//     const sendHeartbeat = () => {
//       axios
//         .post(
//           "http://10.70.10.157:5000/heartbeat",
//           { lastActivityTime: new Date().toISOString() },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         )
//         .then((response) => {
//           console.log(response.data.message);
//           lastActivityTime = Date.now();
//         })
//         .catch((error) => {
//           console.error("Error sending heartbeat:", error);
//           if (error.response?.status === 401) {
//             handleSessionExpiry();
//           }
//         });
//     };

//     const handleSessionExpiry = () => {
//       localStorage.setItem("lastRoute", window.location.pathname);
//       // localStorage.clear();
//       localStorage.removeItem("token");
//       alert("Sesi Anda telah berakhir. Silakan login kembali.");
//       history.push("/login");
//       window.location.reload();
//     }

//     const resetHeartbeat = () => {
//       clearInterval(heartbeatInterval);
//       heartbeatInterval = setInterval(sendHeartbeat, 300000); // Send heartbeat every 5 minute
//     };

//     //60000 = 1 menit 
//     //300000 = 5 menit

//     const handleUserActivity = () => {
//       lastActivityTime = Date.now(); //untuk mendeteksi pergerakan/aktivitas user
//       // isSessionExpired = false;
//       console.log("Last activity time: ", lastActivityTime);
//     };

//    const checkHeartbeatInterval = () => {
//     const currentTime = Date.now();
//     const interval = currentTime - lastActivityTime;

//     console.log("Last activity time: ", lastActivityTime);
//     console.log("Current time: ", currentTime);
//     console.log("Interval: ", interval);

//     // 50000ms
//     //200000ms
//     if (!isSessionExpired && interval >= 200000) {
//       isSessionExpired = true;
//       resetHeartbeat();
//       handleSessionExpiry();
//     }
//    };

//    const events = [
//     "click",
//     "dblclick",
//     "mousedown",
//     "mouseup",
//     "mousemove",
//     "mouseenter",
//     // "mouseleave",
//     // "mouseover",
//     // "mouseout",
//     "keydown",
//     "keyup",
//     "keypress",
//     // "wheel",
//     "scroll",
//     // "load",
//   ];

//   events.forEach((event) => {
//     window.addEventListener(event, handleUserActivity);
//   });

//    sendHeartbeat();

//    heartbeatInterval = setInterval(() => {
//     sendHeartbeat();
//     const currentTime = Date.now();
//     if (currentTime - lastActivityTime > 200000) {
//       handleSessionExpiry();
//     }
//   }, 300000);

//    //60000ms = 1mnt
//    //300000 = 5mnt

//    return () => {
//     clearInterval(heartbeatInterval);
//     events.forEach((event) => {
//       window.removeEventListener(event, handleUserActivity);
//     });
//   };
//   }, [history, location]);

//   return null; 
// };


// let heartbeatInterval = null; // Gunakan variabel global
let inactivityTimer = null;
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in ms
const HEARTBEAT_INTERVAL = 1 * 60 * 1000; //1 minute in ms

const sendHeartbeat = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  axios
    .post(
      "http://10.70.10.157:5000/heartbeat",
      { lastActivityTime: new Date().toISOString() },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((response) => {
      console.log(response.data.message);
    })
    .catch((error) => {
      console.error("Error sending heartbeat:", error);
      if (error.response?.status === 401) {
        handleSessionExpiry();
      }
    });
};


const heartbeatInterval = setInterval(() => {
  sendHeartbeat();
}, HEARTBEAT_INTERVAL);

export const stopInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    clearInterval(heartbeatInterval);
    inactivityTimer = null;
  }
};

const startInactivityTimer = () => {
  // Clear existing timer
  stopInactivityTimer();

  // Start new timer
  inactivityTimer = setTimeout(() => {
    handleSessionExpiry();
  }, SESSION_TIMEOUT);
};



const handleSessionExpiry = () => {
  localStorage.setItem("lastRoute", window.location.pathname);
  // localStorage.removeItem("token");
  stopInactivityTimer();

  axios.post("http://10.70.10.157:5000/logout", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(() => {
          console.log("Logout berhasil, sesi dihapus.");
      })
      .catch(error => {
          console.error("Gagal logout:", error.response?.data?.message || error.message);
      })

  // alert("Sesi Anda telah berakhir. Silakan login kembali.");
  window.location.replace("/login");
  // window.location.reload();
};

const Heartbeat = () => {
  const history = useHistory();
  const location = useLocation();
  let lastActivityTime = Date.now();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const handleUserActivity = () => {
      lastActivityTime = Date.now();
      // console.log("Last activity time: ", lastActivityTime);
      startInactivityTimer();
    };

    startInactivityTimer();
    
    const events = ["click", "dbclick", "mousemove", "mousedown", "mouseup", "mouseover", "mouseenter", "keydown", "keyup", "keypress", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      stopInactivityTimer(); // Hentikan heartbeat saat komponen unmount
      clearInterval(heartbeatInterval);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [history, location]);

  return null;
};



export default Heartbeat;
