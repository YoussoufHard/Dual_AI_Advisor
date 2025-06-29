const CACHE_NAME = 'ai-advisor-v1.0.0';
const STATIC_CACHE = 'ai-advisor-static-v1.0.0';
const DYNAMIC_CACHE = 'ai-advisor-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
  /^https:\/\/generativelanguage\.googleapis\.com\//
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (STATIC_FILES.includes(url.pathname) || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    // Static files - cache first
    event.respondWith(cacheFirst(request));
  } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirst(request));
  } else if (url.pathname === '/' || url.pathname.startsWith('/?')) {
    // SPA routes - serve index.html from cache
    event.respondWith(
      caches.match('/index.html')
        .then((response) => {
          return response || fetch('/index.html');
        })
    );
  } else {
    // Other requests - network first
    event.respondWith(networkFirst(request));
  }
});

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    return new Response('Content not available offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
  
  if (event.tag === 'background-sync-profile') {
    event.waitUntil(syncProfile());
  }
});

// Sync analytics data when back online
async function syncAnalytics() {
  try {
    const offlineData = await getOfflineData('analytics');
    if (offlineData.length > 0) {
      // Send offline analytics data to server
      for (const data of offlineData) {
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      await clearOfflineData('analytics');
      console.log('Service Worker: Analytics data synced');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync analytics', error);
  }
}

// Sync profile data when back online
async function syncProfile() {
  try {
    const offlineData = await getOfflineData('profile');
    if (offlineData.length > 0) {
      // Send offline profile updates to server
      for (const data of offlineData) {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      await clearOfflineData('profile');
      console.log('Service Worker: Profile data synced');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync profile', error);
  }
}

// Helper functions for offline data management
async function getOfflineData(type) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline_data'], 'readonly');
    const store = transaction.objectStore('offline_data');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const allData = request.result;
        const filteredData = allData.filter(item => item.type === type);
        resolve(filteredData.map(item => item.data));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return [];
  }
}

async function clearOfflineData(type) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline_data'], 'readwrite');
    const store = transaction.objectStore('offline_data');
    
    // Get all records and delete those matching the type
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = () => {
      const allData = getAllRequest.result;
      allData.forEach(item => {
        if (item.type === type) {
          store.delete(item.id);
        }
      });
    };
  } catch (error) {
    console.error('Failed to clear offline data:', error);
  }
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ai-advisor-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline_data')) {
        const store = db.createObjectStore('offline_data', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'Vous avez de nouvelles recommandations disponibles !',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir les recommandations',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/action-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('AI Advisor', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?notification=recommendations')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ANALYTICS') {
    // Store analytics data for offline sync
    storeOfflineData('analytics', event.data.payload);
  }
  
  if (event.data && event.data.type === 'CACHE_PROFILE') {
    // Store profile data for offline sync
    storeOfflineData('profile', event.data.payload);
  }
});

async function storeOfflineData(type, data) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline_data'], 'readwrite');
    const store = transaction.objectStore('offline_data');
    
    await store.add({
      type,
      data,
      timestamp: Date.now()
    });
    
    console.log(`Service Worker: ${type} data stored for offline sync`);
  } catch (error) {
    console.error('Failed to store offline data:', error);
  }
}

console.log('Service Worker: Script loaded');