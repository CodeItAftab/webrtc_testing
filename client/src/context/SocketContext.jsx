import { useEffect, useMemo } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const browserId = localStorage.getItem("browserId") || null;
  console.log("Browser ID:", browserId);
  // Check if browserId is already set in localStorage, if not, set a new one
  if (!browserId) {
    const newBrowserId = crypto.randomUUID();
    localStorage.setItem("browserId", newBrowserId);
  }
  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        query: {
          browserId: localStorage.getItem("browserId"),
        },
      }),
    []
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      console.log("Socket ID:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket?.on("connected", (data) => {
      console.log("Connected to server", data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
