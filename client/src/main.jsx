import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { CallProvider } from "./context/CallContext.jsx";
// import { PeerProvider } from "./context/PeerContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <SocketProvider>
      <CallProvider>
        {/* <PeerProvider> */}
        <App />
        {/* </PeerProvider> */}
      </CallProvider>
    </SocketProvider>
  </BrowserRouter>
  // </StrictMode>
);
