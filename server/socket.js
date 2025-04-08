const { Server } = require("socket.io");

let io;

const socketIds = new Array();
const browserIdToSocketId = new Map();

const connectSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "https://webrtc-testing-one.vercel.app",
        methods: ["GET", "POST"],
      },
    });
  }

  io.on("connection", (socket) => {
    // handle the query parameter
    const browserId = socket.handshake.query.browserId;
    socketIds.push(socket.id);
    browserIdToSocketId.set(browserId, socket.id);
    const otherSocketIds = socketIds.filter((id) => id !== socket.id);

    socket.emit("connected", { socketIds: otherSocketIds });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      const index = socketIds.indexOf(socket.id);
      if (index !== -1) {
        socketIds.splice(index, 1);
      }
      browserIdToSocketId.delete(browserId);
      console.log("Updated socketIds:", socketIds);
    });

    socket.on("call-user", ({ browserId, offer }) => {
      console.log("Calling user:", browserId);
      const socketId = browserIdToSocketId.get(browserId);
      if (!socketId) {
        console.log("User not found:", browserId);
        return;
      }
      socket.to(socketId).emit("incomming-call", { from: socket.id, offer });
    });

    socket.on("answer-call", ({ ans, to, browserId }) => {
      console.log("Answering call:", to);
      socket.to(to).emit("call-accepted", { ans, browserId });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      const socketId = browserIdToSocketId.get(to);
      if (socketId) {
        console.log(`Forwarding ICE candidate to ${to}:`, candidate);
        socket.to(socketId).emit("ice-candidate", { candidate });
      } else {
        console.error(`No socket ID found for browserId: ${to}`);
      }
    });

    socket.on("negotiation-needed", ({ offer, to }) => {
      const socketId = browserIdToSocketId.get(to);
      if (socketId) {
        console.log(`Forwarding negotiation-needed to ${to}:`, offer);
        socket
          .to(socketId)
          .emit("negotiation-needed", { offer, from: socket.id });
      } else {
        console.error(`No socket ID found for browserId: ${to}`);
      }
    });

    socket.on("answer-negotiation", ({ ans, to, browserId }) => {
      console.log(`Forwarding answer-negotiation to ${to}:`, ans);
      socket.to(to).emit("negotiation-answered", { ans, browserId });
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { connectSocket, getIO };
