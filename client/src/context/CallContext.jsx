import { createContext, useState } from "react";

const CallContext = createContext(null);

const CallProvider = ({ children }) => {
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [remoteBrowserId, setRemoteBrowserId] = useState(null);

  return (
    <CallContext.Provider
      value={{
        myStream,
        setMyStream,
        remoteStream,
        setRemoteStream,
        isCalling,
        setIsCalling,
        callAccepted,
        setCallAccepted,
        isReceivingCall,
        setIsReceivingCall,
        remoteBrowserId,
        setRemoteBrowserId,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export { CallContext, CallProvider };
