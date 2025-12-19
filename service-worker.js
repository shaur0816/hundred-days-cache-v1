// ===============================
// 百日築基 PWA Service Worker
// 長輩友善版
// ===============================

// 更新版本時請改這個版本號 (避免舊快取)
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `hundred-days-cache-${CACHE_VERSION}`;

// 需要快取的靜態資源
const ASSETS = [
  "index.html",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",

  // CDN 也加入快取
  "https://cdn.jsdelivr.net/npm/chart.js"
];

// ===============================
// Install：建立快取
// ===============================
self.addEventListener("install", (event) => {
  console.log("SW Install…");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: 資源已加入快取");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // 立即啟用新版本
});

// ===============================
// Activate：清除舊版本快取
// ===============================
self.addEventListener("activate", (event) => {
  console.log("SW Activate…");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("SW: 舊快取已刪除 →", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim(); // 立即接管頁面
});

// ===============================
// Fetch：快取優先（可離線）
// ===============================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      // 若已有快取 → 直接用
      if (cachedRes) {
        return cachedRes;
      }

      // 否則從網路取得（fallback）
      return fetch(event.request).catch(() => {
        return caches.match("index.html");
      });
    })
  );
});
