import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Volume2, VolumeX, ZapOff, Zap, RotateCcw, ScanLine } from 'lucide-react'
import toast from 'react-hot-toast'

const SCANNER_ELEMENT_ID = 'html5-qr-scanner-region'
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

// Detect iOS Safari
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export default function BarcodeScanner({ onScan, onClose, isMobile = false }) {
  const scannerRef = useRef(null)
  const lastScannedRef = useRef({ code: null, time: 0 })

  const [soundOn, setSoundOn] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [scanCount, setScanCount] = useState(0)
  const [scanFlash, setScanFlash] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        // state 2 = SCANNING, state 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (_) {}
      scannerRef.current = null
    }
    setCameraReady(false)
  }, [])

  const startScanner = useCallback(async () => {
    await stopScanner()
    setCameraError(null)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      // Ensure element exists before initializing
      const el = document.getElementById(SCANNER_ELEMENT_ID)
      if (!el) {
        setTimeout(() => startScanner(), 100)
        return
      }

      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
      scannerRef.current = scanner

      const config = {
        fps: 12,
        qrbox: isIOS()
          ? { width: 280, height: 180 }
          : { width: 250, height: 160 },
        aspectRatio: isMobile ? 1.0 : 1.777,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      }

      const cameraConfig = { facingMode }

      await scanner.start(
        cameraConfig,
        config,
        (decodedText) => {
          const now = Date.now()
          if (
            decodedText === lastScannedRef.current.code &&
            now - lastScannedRef.current.time < SCAN_COOLDOWN_MS
          ) return

          lastScannedRef.current = { code: decodedText, time: now }
          if (soundOn) playBeep()
          setScanFlash(true)
          setTimeout(() => setScanFlash(false), 400)
          setScanCount((c) => c + 1)
          onScan(decodedText)
        },
        () => {} // ignore decode errors (frames without a barcode)
      )

      setCameraReady(true)
    } catch (err) {
      let msg = 'No se pudo acceder a la cámara.'
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        msg = 'Permiso de cámara denegado. Ve a Ajustes > Safari > Cámara y permite el acceso.'
      } else if (err?.name === 'NotFoundError' || err?.message?.includes('camera')) {
        msg = 'No se encontró ninguna cámara disponible en este dispositivo.'
      } else if (err?.message?.includes('NotReadable') || err?.name === 'NotReadableError') {
        msg = 'La cámara está siendo usada por otra app. Ciérrala e intenta de nuevo.'
      } else {
        msg = `Error de cámara: ${err?.message || err?.name || 'desconocido'}`
      }
      setCameraError(msg)
      toast.error(msg, { duration: 5000 })
    }
  }, [facingMode, soundOn, onScan, stopScanner, isMobile])

  useEffect(() => {
    startScanner()
    return () => { stopScanner() }
  }, [facingMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchCamera = () => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
  }

  const toggleFlash = async () => {
    if (!scannerRef.current) return
    try {
      const track = scannerRef.current?.getRunningTrack?.()
      if (track) {
        await track.applyConstraints({ advanced: [{ torch: !flashOn }] })
        setFlashOn(!flashOn)
      } else {
        toast('Flash no disponible en este dispositivo')
      }
    } catch {
      toast('Flash no disponible en este dispositivo')
    }
  }

  // ───── MOBILE: fullscreen ─────
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black flex flex-col"
      >
        {/* Camera region — html5-qrcode renders its own video here */}
        <div className="relative flex-1 overflow-hidden">
          <div
            id={SCANNER_ELEMENT_ID}
            className="absolute inset-0 w-full h-full"
            style={{ minHeight: '100%' }}
          />

          {/* Reticle overlay */}
          {cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-40">
                {[
                  'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                  'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                  'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                  'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-8 h-8 transition-colors duration-200 ${cls}`}
                    style={{ borderColor: scanFlash ? '#10b981' : '#7c3aee' }}
                  />
                ))}
                <motion.div
                  animate={{ top: ['10%', '85%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-2 right-2 h-0.5"
                  style={{ backgroundColor: scanFlash ? '#10b981' : '#7c3aee', opacity: 0.8 }}
                />
              </div>
            </div>
          )}

          {/* Scan counter */}
          <div className="absolute top-4 right-4 bg-black/60 rounded-xl px-3 py-1.5 backdrop-blur-sm z-10">
            <p className="text-xs text-white font-bold">Escaneados: {scanCount}</p>
          </div>

          {/* Loading */}
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-[#7c3aee] border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm">Iniciando cámara…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-6 z-10">
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-red-400 text-sm">{cameraError}</p>
                <button
                  onClick={startScanner}
                  className="px-4 py-2 rounded-xl bg-[#7c3aee] text-white text-xs font-bold"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="bg-black/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>
          <button
            onClick={toggleFlash}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${flashOn ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}
          >
            {flashOn ? <Zap size={20} /> : <ZapOff size={20} />}
          </button>
          <button
            onClick={switchCamera}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
          >
            <RotateCcw size={18} className="text-white" />
          </button>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${soundOn ? 'bg-[#7c3aee] text-white' : 'bg-white/10 text-white/50'}`}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </motion.div>
    )
  }

  // ───── DESKTOP: inline inside InvoicePanel ─────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-surface-900 overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-subtle bg-surface-800 shrink-0">
        <ScanLine size={14} className="text-brand-400" />
        <span className="text-xs font-bold text-brand-400 flex-1">Escáner Activo</span>
        <span className="text-[10px] text-muted-400 mr-1">Escaneados: {scanCount}</span>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className={`p-1 rounded-lg transition-colors ${soundOn ? 'text-brand-400 hover:text-brand-300' : 'text-muted-500 hover:text-muted-400'}`}
        >
          {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-muted-400 hover:text-danger-400 hover:bg-danger-900/30 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Camera region */}
      <div className="relative bg-black flex-1 w-full overflow-hidden">
        <div
          id={SCANNER_ELEMENT_ID}
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: '100%' }}
        />

        {/* Reticle overlay */}
        {cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-40 h-24">
              {[
                'top-0 left-0 border-t-2 border-l-2 rounded-tl',
                'top-0 right-0 border-t-2 border-r-2 rounded-tr',
                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
                'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 transition-colors duration-200 ${cls}`}
                  style={{ borderColor: scanFlash ? '#10b981' : '#7c3aee' }}
                />
              ))}
              <motion.div
                animate={{ top: ['5%', '90%', '5%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1 right-1 h-px"
                style={{ backgroundColor: scanFlash ? '#10b981' : '#7c3aee', opacity: 0.9 }}
              />
            </div>
          </div>
        )}

        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-[11px]">Iniciando cámara…</p>
            </div>
          </div>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-red-400 text-xs">{cameraError}</p>
              <button
                onClick={startScanner}
                className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-800 border-t border-subtle shrink-0">
        <p className="text-center text-[10px] text-muted-400 py-2">
          Apunta el código al recuadro morado para escanear
        </p>
      </div>
    </motion.div>
  )
}
