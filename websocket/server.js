const { Server } = require("ws");

function createMessageHandler(connection) {
  async function sendResponse(message) {
    const typingEvent = JSON.stringify({
      type: "typing",
      sender: "Bot",
      timestamp: Date.now(),
    });
    connection.send(typingEvent);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const messageEvent = JSON.stringify({
      type: "message",
      sender: "Bot",
      data: `Responding to ${message.data}`,
      timestamp: Date.now(),
    });
    connection.send(messageEvent);
  }

  function messageHandler(event) {
    try {
      const message = JSON.parse(event);

      if (message.type === "message") {
        sendResponse(message);
      }
    } catch (error) {
      console.error("Message format is invalid");
    }
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
