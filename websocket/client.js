function createChatForm(connection) {
  const inputForm = document.getElementById("input-form");
  const inputText = document.getElementById("input-text");
  const responseText = document.getElementById("response-text");

  function sendMessage() {
    connection.send(inputText.value);
    inputText.innerText = "";
  }

  function handleReceive(message) {
    responseText.innerText = message;
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
    messageCallback?.(event.data);
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

  function send(message) {
    ws.send(message);
  }

  function onReceive(cb) {
    messageCallback = cb;
  }

  return { cleanUp, send, onReceive };
}

const SERVER_ENDPOINT = "ws://localhost:8081";
const connection = createConnection(SERVER_ENDPOINT);
createChatForm(connection);
