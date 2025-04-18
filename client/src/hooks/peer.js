import { useContext } from "react";
import PeerContext from "../context/PeerContext";

export const usePeer = () => useContext(PeerContext);
