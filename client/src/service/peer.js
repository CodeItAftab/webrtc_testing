class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:global.stun.twilio.com:3478",
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              // "stun:stun2.l.google.com:19302",
              // "stun:stun3.l.google.com:19302",
              // "stun:stun4.l.google.com:19302",
              // "stun:stun01.sipphone.com",
              // "stun:stun.ekiga.net",
              // "stun:stun.fwdnet.net",
              // "stun:stun.ideasip.com",
              // "stun:stun.iptel.org",
            ],
          },
        ],
      });
    }
  }

  async generateOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  async generateAnswer(offer) {
    if (this.peer) {
      this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setRemoteDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(ans);
    }
  }
  async addIceCandidate(candidate) {
    if (this.peer) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }
}

const peer = new PeerService();
export default peer;
