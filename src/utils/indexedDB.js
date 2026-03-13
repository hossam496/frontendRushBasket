const DB_NAME = 'basket-offline-db'
const DB_VERSION = 1
const STORES = ['products', 'orders', 'user', 'responses']

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function put(storeName, value) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.put(value)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function get(storeName, id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function cacheProducts(products) {
  await put('products', { id: 'all', data: products, timestamp: Date.now() })
}

export async function getCachedProducts() {
  const record = await get('products', 'all')
  return record?.data || []
}

export async function cacheOrders(orders, userEmail) {
  await put('orders', { id: userEmail || 'all', data: orders, timestamp: Date.now() })
}

export async function getCachedOrders(userEmail) {
  const record = await get('orders', userEmail || 'all')
  return record?.data || []
}

export async function cacheUser(user) {
  await put('user', { id: 'current', data: user, timestamp: Date.now() })
}

export async function getCachedUser() {
  const record = await get('user', 'current')
  return record?.data || null
}

export async function cacheApiResponse(key, data) {
  await put('responses', { id: key, data, timestamp: Date.now() })
}

export async function getCachedApiResponse(key) {
  const record = await get('responses', key)
  return record?.data
}

