function createConnection(endpoint) {
  const ws = new WebSocket(endpoint);
  const connectionStatus = document.getElementById("connection-status");
  const connectionError = document.getElementById("connection-error");

  function handleOpen() {
    connectionStatus.innerText = "Online";
    connectionError.innerText = "";
  }

  function handleClose() {
    connectionStatus.innerText = "Offline";
  }

  function handleError(event) {
    connectionError.innerText = "Connection failed";
  }

  ws.addEventListener("open", handleOpen);

  ws.addEventListener("close", handleClose);

  ws.addEventListener("error", handleError);

  function cleanUp() {
    ws.removeEventListener("open", handleOpen);
    ws.removeEventListener("close", handleClose);
    ws.removeEventListener("error", handleError);
  }

  return cleanUp;
}

const SERVER_ENDPOINT = "ws://localhost:3100";
createConnection(SERVER_ENDPOINT);
