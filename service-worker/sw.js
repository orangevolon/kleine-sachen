const imagesCache = "images-cache-v1";
const IMAGE_PATTERN = /https\:\/\/picsum\.photos\//;

self.addEventListener("install", async (event) => {
  console.log("SW: Service worker installed");
});

self.addEventListener("fetch", (event) => {
  async function tryCache() {
    const cache = await caches.open(imagesCache);

    const cacheResponse = await caches.match(event.request);
    if (cacheResponse) return cacheResponse;

    if (!event.request.url.match(IMAGE_PATTERN))
      return await fetch(event.request);

    const response = await fetch(event.request);
    cache.put(event.request, response.clone());
    return response;
  }

  event.respondWith(tryCache());
});
