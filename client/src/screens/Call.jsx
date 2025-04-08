import React, { useCallback, useEffect } from "react";
import { useSocket } from "../hooks/socket";
import PeerService from "../service/peer";
import { useCall } from "../hooks/call";

function Call() {
  const socket = useSocket();
  const {
    setRemoteBrowserId,
    setMyStream,
    setIsCallAccepted,
    setIsCalling,
    isCalling,
    isCallAccepted,
    remoteBrowserId,
  } = useCall();
  const peer = PeerService.peer;
  const myVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);

  useEffect(() => {
    socket?.on("call-accepted", async ({ ans, browserId }) => {
      console.log("Call accepted", ans, browserId);
      // set remote browserId
      setRemoteBrowserId(browserId);
      // set remote stream
      await PeerService.setRemoteDescription(ans);

      alert("Call accepted");
    });
    socket?.on("ice-candidate", async (data) => {
      // console.log("ICE candidate", data);
      // await PeerService.addIceCandidate(data.candidate);
      console.log("ICE candidate", data.candidate);
      await PeerService.addIceCandidate(data.candidate);
      console.log("ICE candidate added", data.candidate);
    });

    socket?.on("negotiation-needed", async ({ offer, from }) => {
      console.log("Negotiation needed", offer, from);
      await PeerService.setRemoteDescription(offer);
      const ans = await PeerService.generateAnswer(offer);
      socket.emit("answer-negotiation", {
        ans,
        to: from,
        browserId: window.localStorage.getItem("browserId"),
      });
    });

    socket?.on("negotiation-answered", async ({ ans, browserId }) => {
      console.log("Negotiation answered", ans, browserId);
      await PeerService.setRemoteDescription(ans);
      alert("Negotiation answered");
    });
  }, [socket, peer, setRemoteBrowserId]);

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    setMyStream(stream);
    myVideoRef.current.srcObject = stream;
    myVideoRef.current.muted = true;
    myVideoRef.current.play();
    // send stream to the peer connection
    for (const track of stream.getTracks()) {
      peer.addTrack(track, stream);
    }
  }, [myVideoRef, peer, setMyStream]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  useEffect(() => {
    peer.onicecandidate = (event) => {
      console.log("ICE candidate event:", event);
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: remoteBrowserId,
        });
      }
    };

    peer.onnegotiationneeded = async (event) => {
      // This event is triggered when the local description needs to be set
      console.log("Negotiation event:", event);
      const offer = await PeerService.generateOffer();
      console.log("Generated offer:", offer);
      socket.emit("negotiation-needed", {
        offer,
        to: remoteBrowserId,
      });
    };

    peer.ontrack = (event) => {
      console.log("Track event:", event);
      const remoteStream = event.streams[0];
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play();
    };
  }, [peer, socket, setIsCalling, setIsCallAccepted, remoteBrowserId]);

  return (
    <div>
      <h1>Video Call</h1>
      <div className="flex flex-col items-center justify-center py-8 gap-8 w-full">
        <h1>
          {isCalling ? "Calling..." : isCallAccepted ? "In Call" : "Idle"}
        </h1>
        <h1>Your Video</h1>
        <video
          id="user_video"
          className="h-40 w-72 bg-slate-200 rounded-md"
          autoPlay
          playsInline
          ref={myVideoRef}
          muted
        ></video>
        <h1>Remote Video</h1>
        <video
          id="remote_video"
          className="h-40 w-72 bg-slate-200 rounded-md"
          autoPlay
          ref={remoteVideoRef}
          playsInline
          muted
        ></video>
      </div>
    </div>
  );
}

export default Call;

// import React, { useCallback, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { useSocket } from "../hooks/socket";
// import { usePeer } from "../hooks/peer";

// function Call() {
//   const socket = useSocket();
//   const {
//     createOffer,
//     createAnswer,
//     setRemoteAnswer,
//     sendStream,
//     remoteStream,
//     peer,
//   } = usePeer();
//   const [mystream, setMyStream] = React.useState(null);
//   const [remoteEmail, setRemoteEmail] = React.useState(null);
//   const myVideoRef = React.useRef(null);
//   const remoteVideoRef = React.useRef(null);

//   const handleNewUserJoined = useCallback(
//     async (data) => {
//       const { email } = data;
//       const offer = await createOffer();
//       socket.emit("call-user", { offer, email });
//       console.log("offer", offer);
//     },
//     [createOffer, socket]
//   );

//   const handleIncommingCall = useCallback(
//     async (data) => {
//       const { offer, from } = data;
//       console.log("incomming-call", offer, from);
//       const ans = await createAnswer(offer);
//       socket.emit("call-accepted", { ans, to: from });
//       // console.log("answer", ans);
//       setRemoteEmail(from);
//     },
//     [createAnswer, socket]
//   );

//   const handleCallAccepted = useCallback(
//     async (data) => {
//       const { ans } = data;
//       console.log("call-accepted", ans);
//       await setRemoteAnswer(ans);
//       sendStream(mystream);
//     },
//     [setRemoteAnswer, sendStream, mystream]
//   );

//   const getUserMediaStream = useCallback(async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: false,
//     });

//     setMyStream(stream);

//     myVideoRef.current.srcObject = stream;
//     myVideoRef.current.muted = true;
//   }, []);

//   useEffect(() => {
//     getUserMediaStream();
//   }, [getUserMediaStream]);

//   useEffect(() => {
//     socket?.on("user-joined", handleNewUserJoined);
//     socket?.on("incomming-call", handleIncommingCall);
//     socket?.on("call-accepted", handleCallAccepted);

//     return () => {
//       socket?.off("user-joined", handleNewUserJoined);
//       socket?.off("incomming-call", handleIncommingCall);
//       socket?.off("call-accepted", handleCallAccepted);
//     };
//   }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted]);

//   const handleIceCandidate = useCallback(
//     (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", {
//           candidate: event.candidate,
//           to: remoteEmail,
//         });
//       }
//     },
//     [socket, remoteEmail]
//   );

//   useEffect(() => {
//     peer.addEventListener("icecandidate", handleIceCandidate);
//     peer.addEventListener("iceconnectionstatechange", () => {
//       console.log("ICE connection state:", peer.iceConnectionState);
//       if (peer.iceConnectionState === "failed") {
//         console.error("ICE connection failed. Retrying...");
//         peer.restartIce();
//       }
//     });

//     return () => {
//       peer.removeEventListener("icecandidate", handleIceCandidate);
//     };
//   }, [peer, handleIceCandidate]);

//   return (
//     <div className="h-full w-full flex flex-col  items-center p-8">
//       <h1>Video Call</h1>
//       <div className="flex justify-center py-8 gap-8 w-full">
//         <video
//           id="user_video"
//           className="h-40 w-72 bg-slate-200 rounded-md"
//           autoPlay
//           playsInline
//           ref={myVideoRef}
//           muted
//         ></video>
//         <video
//           id="remote_video"
//           className="h-40 w-72 bg-slate-200 rounded-md"
//           autoPlay
//           ref={remoteVideoRef}
//           playsInline
//           muted
//         ></video>
//       </div>
//       <Button variant="destructive" className="cursor-pointer">
//         End Call
//       </Button>
//     </div>
//   );
// }

// export default Call;
