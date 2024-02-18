async function initSw() {
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error(error);
    console.error("Could not register service worker");
  }
}

async function createImages(root) {
  const baseUrl = "https://picsum.photos/";
  const size = 200;
  const count = 10;

  function cleanUpImages() {
    const imageContainer = document.querySelector(".image-container");
    if (imageContainer) imageContainer.remove();
  }

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

  cleanUpImages();
  const container = createImageContainer();
  createImages(container);
}

function clearCache() {
  try {
    navigator.serviceWorker.controller.postMessage("clear-cache");
  } catch (error) {
    console.error("Could not clear the cache");
    console.error(error);
  }
}

function createControls(root) {
  const controlsContainer = document.createElement("section");
  controlsContainer.classList.add("control-container");
  root.appendChild(controlsContainer);

  const loadButton = document.createElement("button");
  loadButton.innerText = "Load images";
  loadButton.classList.add("primary");
  loadButton.addEventListener("click", () => createImages(root));

  const clearCacheButton = document.createElement("button");
  clearCacheButton.innerText = "Clear cache";
  clearCacheButton.addEventListener("click", clearCache);

  controlsContainer.appendChild(loadButton);
  controlsContainer.appendChild(clearCacheButton);
}

(async function main() {
  await initSw();

  const root = document.getElementById("root");
  createControls(root);
})();
