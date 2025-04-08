const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const { connectSocket } = require("./socket.js");

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

server.listen(3000, (err) => {
  if (err) {
    console.log(err.message);
  }

  connectSocket(server);

  console.log("Server is running on port 3000");
});
