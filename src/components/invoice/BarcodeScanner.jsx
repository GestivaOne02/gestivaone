import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X, ScanLine, AlertTriangle } from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const SCAN_COOLDOWN_MS = 1500

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch (_) {}
}

function BaseScanner({ onScan, onClose, isMobile }) {
  const [scanCount, setScanCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [status, setStatus] = useState('loading')
  const lastRef = useRef({ code: null, time: 0 })
  const scannerRef = useRef(null)
  const isMountedRef = useRef(true)

  // Memorize the callback to avoid re-triggering the useEffect on every render
  const handleScanSuccess = useCallback((decodedText) => {
    const now = Date.now()
    if (decodedText === lastRef.current.code && now - lastRef.current.time < SCAN_COOLDOWN_MS) {
      return
    }
    lastRef.current = { code: decodedText, time: now }
    playBeep()
    setScanCount(c => c + 1)
    onScan(decodedText)
  }, [onScan])

  useEffect(() => {
    isMountedRef.current = true
    let isStarting = false
    let localScanner = null

    const startScanner = async () => {
      try {
        if (!isMountedRef.current) return
        setStatus('loading')
        isStarting = true

        // Optimize decoder: only scan necessary retail/logistics formats
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ]

        localScanner = new Html5Qrcode("gestiva-barcode-reader", { formatsToSupport })
        scannerRef.current = localScanner

        const cameraConfig = {
          facingMode: "environment"
        }

        // Limit FPS to 10 to save CPU and battery. Add qrbox (Region Of Interest)
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        }

        await localScanner.start(
          cameraConfig,
          config,
          handleScanSuccess,
          () => {} // Ignore scan failure callbacks (fires on every frame without a barcode)
        )
        isStarting = false

        if (isMountedRef.current) {
          setStatus('ready')
        } else {
          // If component was unmounted while camera was warming up, destroy it immediately
          localScanner.stop().then(() => localScanner.clear()).catch(e => console.warn(e))
        }
      } catch (err) {
        isStarting = false
        console.error("Camera Error:", err)
        if (!isMountedRef.current) return
        setStatus('error')
        if (err?.name === 'NotAllowedError' || String(err).includes('ermission')) {
          setErrorMsg('Acceso denegado. Permite la cámara en Ajustes del Navegador.')
        } else if (String(err).includes('NotReadableError') || String(err).includes('track')) {
          setErrorMsg('Cámara bloqueada o en uso por otra aplicación.')
        } else {
          setErrorMsg(`Error cámara: ${err?.message || err}`)
        }
      }
    }

    // Delay start slightly to guarantee the DOM element #gestiva-barcode-reader is mounted
    const timer = setTimeout(() => {
      startScanner()
    }, 150)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      
      // Cleanup sequence
      if (localScanner) {
        if (localScanner.isScanning) {
          localScanner.stop().then(() => {
            localScanner.clear()
          }).catch(e => console.warn('Error stopping scanner:', e))
        } else if (!isStarting) {
          localScanner.clear()
        }
      }
    }
  }, [handleScanSuccess])

  const ui = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={isMobile ? "fixed inset-0 z-[99999] flex flex-col bg-surface-900 overflow-hidden" : "w-full max-w-sm mx-auto bg-surface-900 border border-subtle overflow-hidden flex flex-col relative"}
      style={!isMobile ? { borderRadius: 16, height: 400 } : {}}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-subtle bg-surface-800 shrink-0 z-20 absolute top-0 left-0 w-full shadow-lg">
        <ScanLine size={14} className="text-brand-400" />
        <span className="text-xs font-bold text-brand-400 flex-1">Escáner Activo</span>
        <span className="text-[10px] text-muted-400 mr-1">Escaneados: {scanCount}</span>
        <button onClick={onClose} className="p-1 rounded-lg text-muted-400 hover:text-danger-400 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden pt-[45px] pb-[40px]">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface-900/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-brand-400 animate-pulse">Iniciando cámara segura...</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface-900 p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-danger-500/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-danger-400" />
              </div>
              <p className="text-xs text-muted-300 max-w-[250px] leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Container for html5-qrcode */}
        <div 
          id="gestiva-barcode-reader" 
          className="w-full h-full"
          style={{ overflow: 'hidden', width: '100%', height: '100%' }}
        />

        {/* Global Styles to override html5-qrcode defaults and hide redundant UI */}
        <style dangerouslySetInnerHTML={{__html: `
          #gestiva-barcode-reader { border: none !important; background: black; }
          #gestiva-barcode-reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
          #qr-shaded-region { border-color: rgba(0,0,0,0.5) !important; }
        `}} />

        {/* Custom Glowing Frame Overlay overlaying the qrbox */}
        {status === 'ready' && (
          <div className="absolute inset-0 pointer-events-none mt-[45px] mb-[40px] flex items-center justify-center">
            <div className="relative w-[250px] h-[150px] border-2 border-brand-500/50 rounded-2xl flex items-center justify-center">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-400 rounded-tl-xl -translate-x-0.5 -translate-y-0.5" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-400 rounded-tr-xl translate-x-0.5 -translate-y-0.5" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-400 rounded-bl-xl -translate-x-0.5 translate-y-0.5" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-400 rounded-br-xl translate-x-0.5 translate-y-0.5" />
              <motion.div
                className="w-full h-0.5 bg-brand-400/80 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                animate={{ y: [-65, 65, -65] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-800 border-t border-subtle py-2 shrink-0 z-20 pb-safe absolute bottom-0 left-0 w-full shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
        <p className="text-center text-[10px] text-muted-400">Apunta al recuadro para escanear el código</p>
      </div>
    </motion.div>
  )

  if (isMobile && typeof document !== 'undefined') {
    return createPortal(ui, document.body)
  }
  return ui
}

export default function BarcodeScanner({ onScan, onClose, isMobile = false }) {
  return (
    <BaseScanner 
      onScan={onScan} 
      onClose={onClose} 
      isMobile={isMobile} 
    />
  )
}
