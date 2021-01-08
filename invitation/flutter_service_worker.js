'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "94fd295d1bbe2aec1db22600ba04139d",
"assets/audios/music.mp3": "0c2ad00b39183aa097302758b10b46f6",
"assets/FontManifest.json": "0f769a984d09f72fef3d8577e4724473",
"assets/fonts/DancingScript-Bold.ttf": "d45862789a79a733f148e5177ea6953a",
"assets/fonts/DancingScript-Medium.ttf": "2b9b7690ea41eca720fedddff070e153",
"assets/fonts/DancingScript-Regular.ttf": "c4434ab21f7144bbcf88c9a35ae3f075",
"assets/fonts/DancingScript-SemiBold.ttf": "415dfbf4ab2df060fe2d9eade2824767",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"assets/fonts/Nunito-Bold.ttf": "c0844c990ecaaeb9f124758d38df4f3f",
"assets/fonts/Nunito-Regular.ttf": "d8de52e6c5df1a987ef6b9126a70cfcc",
"assets/fonts/Nunito-SemiBold.ttf": "876701bc4fbf6166f07f152691b15159",
"assets/fonts/Sacramento-Regular.ttf": "66b0e223824fd123ab079b60da594ea7",
"assets/images/ava_boy.png": "59514aa9f80d62fbacc287df3f1adfa5",
"assets/images/ava_girl.png": "9b65c0501df12ef894156cc90f92d84e",
"assets/images/bottom_leaf.png": "af30240bf8e38ead7f2b86165a089b67",
"assets/images/leaf.png": "db5aa219214223c52204ffc1fbbea792",
"assets/images/left_leaf.png": "da02cb00e5f953a6c3fee94823ffb2a8",
"assets/images/mosque.jpg": "c182ae5bb1340e40e2a3aa9198496089",
"assets/images/party.jpg": "2289de3de54b5f9ce70d3bf034582fc8",
"assets/images/right_leaf.png": "6d190f470a426f0227cef94daf7b1ca4",
"assets/images/top_leaf.png": "a6a023109083b58052b149dd77bee9eb",
"assets/images/wed1.jpeg": "dccd401e7d112d974aedbb691629b74b",
"assets/images/wed10.jpeg": "9bb6e594daedcead51492c589361a7b2",
"assets/images/wed11.jpeg": "9bb6e594daedcead51492c589361a7b2",
"assets/images/wed12.jpeg": "9bb6e594daedcead51492c589361a7b2",
"assets/images/wed2.jpeg": "e531bda5d0271e7af016687daf2d5b1c",
"assets/images/wed3.jpeg": "7fc4ae8fc7f66fd3aa5e7f5e7fdc13ce",
"assets/images/wed4.jpeg": "64040d95c6c3e8a320d9fb4b35d24ed4",
"assets/images/wed5.jpeg": "843b9b69af02e9b509eabd70595d1cc8",
"assets/images/wed6.jpeg": "91b9044266f67acad0df5fc5d7a204be",
"assets/images/wed7.jpeg": "a50995e16721719c38bf73e34d7aa2d2",
"assets/images/wed8.jpeg": "9bb6e594daedcead51492c589361a7b2",
"assets/images/wed9.jpeg": "9bb6e594daedcead51492c589361a7b2",
"assets/NOTICES": "4af700cad87bc395049506ed2243faa4",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "648234256e6d96a612b681bcc583bbff",
"/": "648234256e6d96a612b681bcc583bbff",
"main.dart.js": "9d33756553f25071b2073f9ca5f380b4",
"manifest.json": "6314eafdea8c7b526a6cf50df0d3541f"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }
  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
