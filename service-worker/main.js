async function initSw() {
  try {
    const rg = await navigator.serviceWorker.register("/sw.js");
    console.log("Browser: Service worker is registered successfully", rg);
  } catch (error) {
    console.error(error);
    console.error("Could not register service worker");
  }
}

async function createImages(root) {
  const baseUrl = "https://picsum.photos/";
  const size = 200;
  const count = 64;

  function createImageContainer() {
    const container = document.createElement("section");
    container.classList.add("image-container");

    root.appendChild(container);
    return container;
  }

  function createImage(container, id) {
    const img = document.createElement("img");
    const { origin } = new URL(baseUrl);
    img.src = `${origin}/${size}?random=${id}`;
    img.classList.add("image");

    container.appendChild(img);
  }

  function createImages(container) {
    for (let idx = 0; idx < count; idx++) createImage(container, idx);
  }

  const container = createImageContainer();
  createImages(container);
}

(async function main() {
  await initSw();

  const root = document.getElementById("root");
  createImages(root);
})();
