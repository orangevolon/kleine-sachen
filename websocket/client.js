function createChatForm(connection) {
  const inputForm = document.getElementById("input-form");
  const inputText = document.getElementById("input-text");
  const responseText = document.getElementById("response-text");

  function removeTransients() {
    const transients = responseText.querySelectorAll(".transient");
    for (const transient of transients) transient.remove();
  }

  function addChatEntry({ text, sender, direction, transient }) {
    const entry = document.createElement("li");
    entry.innerHTML = `<strong>${sender}:</strong> ${text}`;
    entry.classList.add("chat-entry");
    entry.classList.add(direction);

    if (transient) {
      entry.classList.add("transient");
    }

    removeTransients();
    responseText.appendChild(entry);
  }

  function sendMessage() {
    const text = inputText.value;

    addChatEntry({
      sender: "Me",
      text,
      direction: "send",
    });

    const message = {
      type: "message",
      sender: "Me",
      data: text,
      timestamp: Date.now(),
    };
    connection.sendMessage(message);
  }

  function handleReceive(message) {
    switch (message.type) {
      case "message":
        return addChatEntry({
          sender: message.sender,
          text: message.data,
          direction: "receive",
          transient: false,
        });
      case "typing":
        return addChatEntry({
          sender: message.sender,
          text: "Typing...",
          direction: "receive",
          transient: true,
        });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeydown(event) {
    if (event.key !== "Enter") return;
    if (!event.metaKey) return;

    sendMessage();
  }

  connection.onReceive(handleReceive);
  inputForm.addEventListener("submit", handleSubmit);
  inputForm.addEventListener("keydown", handleKeydown);

  function cleanUp() {
    connection.onReceive = undefined;
    inputForm.removeEventListener("submit", handleSubmit);
  }

  return { cleanUp };
}

function createConnection(endpoint) {
  const ws = new WebSocket(endpoint);
  const connectionStatus = document.getElementById("connection-status");
  const connectionError = document.getElementById("connection-error");
  let messageCallback;

  function handleOpen() {
    connectionStatus.innerText = "Online";
    connectionError.innerText = "";
  }

  function handleClose() {
    connectionStatus.innerText = "Offline";
  }

  function handleError() {
    connectionError.innerText = "Connection failed";
  }

  function handleMessage(event) {
    try {
      const decodedMessage = JSON.parse(event.data);
      messageCallback?.(decodedMessage);
    } catch (error) {
      console.error("Message format is invalid");
    }
  }

  ws.addEventListener("open", handleOpen);
  ws.addEventListener("close", handleClose);
  ws.addEventListener("error", handleError);
  ws.addEventListener("message", handleMessage);

  function cleanUp() {
    ws.close();

    ws.removeEventListener("open", handleOpen);
    ws.removeEventListener("close", handleClose);
    ws.removeEventListener("error", handleError);
    ws.removeEventListener("message", handleMessage);
  }

  function sendMessage(message) {
    ws.send(JSON.stringify(message));
  }

  function onReceive(cb) {
    messageCallback = cb;
  }

  return { cleanUp, sendMessage, onReceive };
}

const SERVER_ENDPOINT = "ws://localhost:8081";
const connection = createConnection(SERVER_ENDPOINT);
createChatForm(connection);
