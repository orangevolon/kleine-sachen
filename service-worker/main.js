async function initSw() {
  try {
    const rg = await navigator.serviceWorker.register("/sw.js");
    console.log("Browser: Service worker is registered successfully", rg);
  } catch (error) {
    console.error(error);
    console.error("Could not register service worker");
  }
}

initSw();
