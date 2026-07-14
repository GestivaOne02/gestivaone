import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, Camera, ZapOff, Zap, RotateCcw, ScanLine } from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function BarcodeScanner({ onScan, onClose, isMobile = false }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const lastScannedRef = useRef({ code: null, time: 0 })

  const [soundOn, setSoundOn] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [scanCount, setScanCount] = useState(0)
  const [scanFlash, setScanFlash] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const streamRef = useRef(null)

  const stopCamera = useCallback(() => {
    if (readerRef.current) {
      try { readerRef.current.reset() } catch (_) {}
      readerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    stopCamera()
    setCameraError(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('NO_HTTPS')
      }

      const { BrowserMultiFormatReader } = await import('@zxing/library')
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch (err) {
        // Fallback si falla por constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // o solo true si esto falla
        }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }))
      }

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }

      reader.decodeFromStream(stream, videoRef.current, (result, err) => {
        if (result) {
          const code = result.getText()
          const now = Date.now()
          if (
            code === lastScannedRef.current.code &&
            now - lastScannedRef.current.time < SCAN_COOLDOWN_MS
          ) return

          lastScannedRef.current = { code, time: now }
          if (soundOn) playBeep()
          setScanFlash(true)
          setTimeout(() => setScanFlash(false), 400)
          setScanCount((c) => c + 1)
          onScan(code)
        }
      })
    } catch (err) {
      let msg = 'No se pudo acceder a la cámara.'
      if (err?.message === 'NO_HTTPS') {
        msg = 'El navegador bloqueó la cámara. Se requiere conexión segura (HTTPS) o localhost.'
      } else if (err?.name === 'NotAllowedError') {
        msg = 'Permiso denegado. Habilita la cámara en los ajustes de tu navegador.'
      } else if (err?.name === 'NotFoundError') {
        msg = 'No se detectó ninguna cámara en este dispositivo.'
      } else if (err?.name === 'NotReadableError') {
        msg = 'La cámara está siendo usada por otra aplicación.'
      }
      setCameraError(msg)
      toast.error(msg)
    }
  }, [facingMode, soundOn, onScan, stopCamera])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [facingMode])

  const toggleFlash = async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !flashOn }] })
      setFlashOn(!flashOn)
    } catch {
      toast.error('Flash no disponible en este dispositivo')
    }
  }

  const switchCamera = () => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
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
        {/* Camera */}
        <div className="relative flex-1 overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Scan reticle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-40">
              {/* Corner lines */}
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
              {/* Scan line animation */}
              <motion.div
                animate={{ top: ['10%', '85%', '10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-2 right-2 h-0.5"
                style={{ backgroundColor: scanFlash ? '#10b981' : '#7c3aee', opacity: 0.8 }}
              />
              {scanFlash && (
                <div className="absolute inset-0 rounded-xl bg-green-400/20 border-2 border-green-400" />
              )}
            </div>
          </div>

          {/* Scan counter badge */}
          <div className="absolute top-4 right-4 bg-black/60 rounded-xl px-3 py-1.5 backdrop-blur-sm">
            <p className="text-xs text-white font-bold">Escaneados: {scanCount}</p>
          </div>

          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm">Iniciando cámara...</p>
              </div>
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
              <p className="text-red-400 text-sm text-center">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="bg-black/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between gap-4 safe-area-bottom">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>
          <button
            onClick={toggleFlash}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${flashOn ? 'bg-yellow-500 text-black' : 'bg-surface-700 text-white'}`}
          >
            {flashOn ? <Zap size={20} /> : <ZapOff size={20} />}
          </button>
          <button
            onClick={switchCamera}
            className="w-12 h-12 rounded-full bg-surface-700 flex items-center justify-center"
          >
            <RotateCcw size={18} className="text-white" />
          </button>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${soundOn ? 'bg-brand-600 text-white' : 'bg-surface-700 text-muted-400'}`}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </motion.div>
    )
  }

  // ───── DESKTOP: flex container ─────
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
          title={soundOn ? 'Desactivar sonido' : 'Activar sonido'}
        >
          {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-muted-400 hover:text-danger-400 hover:bg-danger-900/30 transition-colors"
          title="Apagar escáner"
        >
          <X size={14} />
        </button>
      </div>

      {/* Camera preview */}
      <div className="relative bg-black flex-1 w-full h-full">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Reticle */}
        <div className="absolute inset-0 flex items-center justify-center">
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
            {scanFlash && (
              <div className="absolute inset-0 rounded bg-green-400/20 border border-green-400" />
            )}
          </div>
        </div>

        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-[11px]">Iniciando cámara...</p>
            </div>
          </div>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-3">
            <p className="text-red-400 text-xs text-center">{cameraError}</p>
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
