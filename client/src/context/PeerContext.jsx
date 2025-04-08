import React, { useCallback, useEffect, useMemo } from "react";
import { useSocket } from "../hooks/socket";

const PeerContext = React.createContext(null);

const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = React.useState(null);
  const socket = useSocket();
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    []
  );

  const createOffer = async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createAnswer = async (offer) => {
    try {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const setRemoteAnswer = async (answer) => {
    try {
      await peer.setRemoteDescription(answer);
    } catch (error) {
      console.error("Error setting remote answer:", error);
    }
  };

  const sendStream = (stream) => {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  };

  const handleOnTrack = useCallback((event) => {
    const streams = event.streams;
    setRemoteStream(streams[0]);
  }, []);

  const handleNegociationNeeded = useCallback(async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      // Emit the offer to the other peer
    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  }, [peer]);

  useEffect(() => {
    socket.on("ice-candidate", (data) => {
      const { candidate } = data;
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("ice-candidate");
    };
  }, [socket, peer]);

  useEffect(() => {
    peer.addEventListener("track", handleOnTrack);
    peer.addEventListener("negotiationneeded", handleNegociationNeeded);
    // peer.addEventListener("icecandidate", hanldeIceCandidate);
    return () => {
      peer.removeEventListener("track", handleOnTrack);
      peer.removeEventListener("negotiationneeded", handleNegociationNeeded);
    };
  }, [peer, handleOnTrack, handleNegociationNeeded]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendStream,
        remoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export default PeerContext;
export { PeerProvider };
