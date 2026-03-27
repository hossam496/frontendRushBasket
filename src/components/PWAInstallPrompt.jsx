import React, { useEffect, useState, useCallback } from 'react'
import { FiDownload, FiX, FiSmartphone, FiMonitor } from 'react-icons/fi'
import toast from 'react-hot-toast'

/**
 * PWAInstallPrompt Component
 * Implements a professional "Install App" experience.
 * Features: event listener, modern UI, visibility logic, and background sync triggers.
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 1. Listen for the "beforeinstallprompt" event
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Show our custom install button
      setIsVisible(true)

      // Bonus: Show toast invitation
      toast("Install our app for a better experience 🚀", {
        duration: 5000,
        position: 'bottom-right',
        icon: '📱',
        style: {
          borderRadius: '16px',
          background: '#4f46e5',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '14px',
          marginTop: '5px'
        }
      })
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false)
    }

    // Detect mobile for specific styling
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`[PWA] User response to install prompt: ${outcome}`)

    if (outcome === 'accepted') {
      setIsVisible(false)
      setDeferredPrompt(null)
      toast.success("App installation started! Check your device home screen.", {
        position: 'bottom-center'
      })
    }
  }, [deferredPrompt])

  const dismissPrompt = () => {
    setIsVisible(false)
    // Optional: save to local storage to not show again for 24h
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Logic: Check if it was dismissed recently
  useEffect(() => {
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 86400000) {
      setIsVisible(false)
    }
  }, [])

  if (!isVisible || !deferredPrompt) return null

  return (
    <div className="fixed bottom-6 right-6 z-60 flex flex-col items-end gap-3 transition-all duration-500 animate-slideUp">
      {/* Desktop/Tablet Message Prompt (Small bubble) */}
      {!isMobile && (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl p-4 rounded-2xl mb-1 max-w-[280px] hidden sm:block">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-black text-slate-900 tracking-tight">Enjoy FlashBasket offline</h4>
            <button onClick={dismissPrompt} className="text-slate-400 hover:text-rose-500 transition-colors">
              <FiX size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Install our desktop app for instant notifications and faster access to your orders.
          </p>
        </div>
      )}

      {/* Main Install Button */}
      <button
        onClick={handleInstall}
        className={`
          flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl
          bg-indigo-600 text-white font-black text-sm uppercase tracking-widest
          hover:bg-indigo-700 hover:scale-105 active:scale-95
          transition-all duration-300 border-4 border-white ring-8 ring-indigo-500/10
          group
        `}
      >
        <div className="relative">
          <FiDownload className="text-xl animate-bounce" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></div>
        </div>
        <span>Install App</span>

        {/* Hover Sparkle Effect */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity blur-xl"></div>
      </button>

      {/* Device Indicator */}
      <div className="mr-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">
        {isMobile ? <FiSmartphone /> : <FiMonitor />}
        Available for your device
      </div>
    </div>
  )
}

export default React.memo(PWAInstallPrompt)
