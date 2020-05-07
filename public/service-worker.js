// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var dataCacheName = 'exampleName-v1';
var cacheName = 'exampleNameCache';
var filesToCache = [
  '/',
  '/scripts/app.js',
  '/styles/inline.css',
  '/styles/bootstrap.min.css',
  '/scripts/bootstrap.min.js',
  '/scripts/jquery.min.js',
  '/scripts/database.js',
  '/fonts/glyphicons-halflings-regular.woff2',
  '/fonts/glyphicons-halflings-regular.woff',
  '/fonts/glyphicons-halflings-regular.ttf',
  '/images/icons/icon-32x32.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-256x256.png',
  '/manifest.json'
];


/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});


/**
 * this is called every time a file is fetched. This is a middleware, i.e. this method is
 * called every time a page is fetched by the browser
 * there are two main branches:
 * /[INSERT HERE] to get data about the response from the server. if offline, the fetch will fail and the
 *      control will be sent back to Ajax with an error - you will have to recover the situation
 *      from there (e.g. showing the cached data)
 * all the other pages are searched for in the cache. If not found, they are returned
 */
self.addEventListener('fetch', function (e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = '';
  //TODO: Add any pages here that we do not want to be cached
  //if the request is contained in data url do not cache
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    return fetch(e.request).then(function (response) {
      // note: it the network is down, response will contain the error
      // that will be passed to Ajax
      return response;
    })
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function (response) {
        return response
          || fetch(e.request)
            .then(function (response) {
              // note if network error happens, fetch does not return
              // an error. it just returns response not ok
              // https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
              if (!response.ok) {
                console.log("error: " + response.error());
              }
            })
            .catch(function (e) {
              console.log("error: " + err);
            })
      })
    );
  }
});