import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "../hooks/socket";
import PeerService from "../service/peer";
import { useCall } from "../hooks/call";

function Home() {
  const [browserId, setBrowserId] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();
  const { setRemoteBrowserId } = useCall();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const offer = await PeerService.generateOffer();
      socket?.emit("call-user", { browserId, offer });
      navigate("/call");
    },
    [socket, browserId, navigate]
  );

  socket?.on("incomming-call", async ({ from, offer }) => {
    console.log("Incoming call from:", from);
    await PeerService.setRemoteDescription(offer);

    // Navigate to the call page with the browserId of the caller
    if (confirm("Incoming call from " + from + ". Do you want to accept?")) {
      // set the browserId of the caller
      setRemoteBrowserId(from);
      // send answer to the caller
      const ans = await PeerService.generateAnswer(offer);
      socket.emit("answer-call", {
        ans,
        to: from,
        browserId: window.localStorage.getItem("browserId"),
      });
      navigate("/call", { state: { browserId: from } });
    }
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-svh bg-slate-200">
      <form
        className="flex flex-col justify-center  gap-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-4xl">Join a Room</h1>
        <Input
          required
          placeholder="Enter browserId"
          type="text"
          className="w-72 bg-white shrink-0"
          value={browserId}
          onChange={(e) => setBrowserId(e.target.value)}
        />
        <Button type="submit" className="grow-0 cursor-pointer">
          Call
        </Button>
      </form>
    </div>
  );
}

export default Home;
