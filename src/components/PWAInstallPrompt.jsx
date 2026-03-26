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

      // Bonus: Premium toast invitation
      toast("Install our app for a better experience 🚀", {
        duration: 5000,
        position: 'bottom-right',
        icon: '📱',
        style: {
          borderRadius: '20px',
          background: 'rgba(5, 46, 22, 0.9)',
          backdropFilter: 'blur(12px)',
          color: '#ecfdf5',
          fontWeight: '600',
          fontSize: '14px',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          fontFamily: "'Poppins', sans-serif"
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
    <div className="fixed bottom-6 right-6 z-60 flex flex-col items-end gap-4 transition-all duration-700 animate-slideUp">
      {/* Premium Glassmorphic Message Prompt */}
      {!isMobile && (
        <div className="bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl p-5 rounded-2xl mb-1 max-w-[300px] hidden sm:block relative overflow-hidden group/card">
          {/* Subtle Pulse Background */}
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2.5">
              <h4 className="text-sm font-bold text-emerald-50 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Enjoy RushBasket offline
              </h4>
              <button onClick={dismissPrompt} className="text-emerald-400/50 hover:text-emerald-300 transition-colors p-1 hover:bg-emerald-800/50 rounded-lg">
                <FiX size={16} />
              </button>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
              Install our desktop app for instant notifications and faster access to your orders.
            </p>
          </div>
        </div>
      )}

      {/* Modern Gradient Install Button */}
      <button
        onClick={handleInstall}
        className={`
          relative flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl
          bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm uppercase tracking-widest
          hover:from-emerald-400 hover:to-teal-500 hover:scale-[1.03] active:scale-95
          transition-all duration-500 border border-emerald-400/30
          group overflow-hidden
        `}
      >
        {/* Shine Animation */}
        <div className="absolute inset-x-0 top-0 h-full w-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-30 -translate-x-full group-hover:animate-shine"></div>

        <div className="relative">
          <FiDownload className="text-xl group-hover:-translate-y-1 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-emerald-900 animate-pulse"></div>
        </div>
        <span className="relative z-10">Install App</span>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
      </button>

      {/* Device Indicator */}
      <div className="mr-6 flex items-center gap-2 text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">
        {isMobile ? <FiSmartphone className="text-emerald-400" /> : <FiMonitor className="text-emerald-400" />}
        <span>Multi-Device Support</span>
      </div>
    </div>
  )
}

export default React.memo(PWAInstallPrompt)
