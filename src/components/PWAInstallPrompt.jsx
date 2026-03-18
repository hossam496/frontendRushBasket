import React, { useEffect, useState } from 'react'
import { subscribeUserToPush } from '../utils/pushNotifications'

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsVisible(false)
      setDeferredPrompt(null)
      // Try to subscribe to push notifications after installation
      try {
        await subscribeUserToPush()
      } catch (e) {
        // Non-fatal
        console.error('Push subscription failed', e)
      }
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/95 shadow-2xl border border-emerald-600/60 p-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-emerald-300">
            Install Basket App
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Get a faster, full-screen experience and offline access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-900 text-xs font-semibold shadow hover:bg-emerald-400 transition"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
