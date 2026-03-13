import axios from 'axios'

const BACKEND_URL = 'http://localhost:5000'

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null
  }

  const registration = await navigator.serviceWorker.ready

  const { data } = await axios.get(`${BACKEND_URL}/api/notifications/public-key`)
  const vapidPublicKey = data.publicKey

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  })

  await axios.post(`${BACKEND_URL}/api/notifications/subscribe`, subscription, {
    headers: { 'Content-Type': 'application/json' }
  })

  return subscription
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

