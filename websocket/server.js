const { Server } = require("ws");

function createMessageHandler(connection) {
  function messageHandler(message) {
    const response = `We received: ${message}`;
    connection.send(response);
  }

  return { messageHandler };
}

function createServer(port) {
  const server = new Server({ port });

  function handleConnection(ws) {
    const { messageHandler } = createMessageHandler(ws);
    ws.on("message", messageHandler);
  }

  function cleanUp() {
    server.off("connection", handleConnection);
  }

  server.on("connection", handleConnection);

  return cleanUp;
}

const PORT = 8081;
createServer(PORT);
