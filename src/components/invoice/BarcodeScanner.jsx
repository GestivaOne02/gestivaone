import { useEffect, useRef, useState, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, ZapOff, Zap, RotateCcw, ScanLine } from 'lucide-react'
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

// ─────────────────────────────────────────────
// Desktop inline scanner (inside InvoicePanel)
// ─────────────────────────────────────────────
function DesktopScanner({ onScan, onClose }) {
  const elementId = 'gestiva-scanner-desktop'
  const scannerRef = useRef(null)
  const lastScannedRef = useRef({ code: null, time: 0 })
  const mountedRef = useRef(false)

  const [soundOn, setSoundOn] = useState(true)
  const [scanCount, setScanCount] = useState(0)
  const [scanFlash, setScanFlash] = useState(false)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.()
        if (state === 2 || state === 3) await scannerRef.current.stop()
        scannerRef.current.clear?.()
      } catch (_) {}
      scannerRef.current = null
    }
  }, [])

  const startScanner = useCallback(async () => {
    if (!mountedRef.current) return
    await stopScanner()
    setStatus('loading')
    setErrorMsg('')

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (!mountedRef.current) return
      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 130 }, disableFlip: false },
        (text) => {
          const now = Date.now()
          if (text === lastScannedRef.current.code && now - lastScannedRef.current.time < SCAN_COOLDOWN_MS) return
          lastScannedRef.current = { code: text, time: now }
          if (soundOn) playBeep()
          setScanFlash(true)
          setTimeout(() => setScanFlash(false), 400)
          setScanCount(c => c + 1)
          onScan(text)
        },
        () => {}
      )
      if (mountedRef.current) setStatus('ready')
    } catch (err) {
      if (!mountedRef.current) return
      setStatus('error')
      setErrorMsg(buildErrorMsg(err))
    }
  }, [soundOn, onScan, stopScanner])

  useEffect(() => {
    mountedRef.current = true
    // Small delay to ensure DOM is ready
    const t = setTimeout(() => startScanner(), 80)
    return () => {
      clearTimeout(t)
      mountedRef.current = false
      stopScanner()
    }
  }, []) // eslint-disable-line

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-surface-900 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-subtle bg-surface-800 shrink-0">
        <ScanLine size={14} className="text-brand-400" />
        <span className="text-xs font-bold text-brand-400 flex-1">Escáner Activo</span>
        <span className="text-[10px] text-muted-400 mr-1">Escaneados: {scanCount}</span>
        <button onClick={() => setSoundOn(s => !s)} className={`p-1 rounded-lg transition-colors ${soundOn ? 'text-brand-400' : 'text-muted-500'}`}>
          {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
        <button onClick={onClose} className="p-1 rounded-lg text-muted-400 hover:text-danger-400 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Camera area */}
      <div className="relative bg-black flex-1 overflow-hidden">
        <div id={elementId} className="w-full h-full" style={{ minHeight: '180px' }} />

        {/* Reticle overlay */}
        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-28">
              {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 ${cls} transition-colors`} style={{ borderColor: scanFlash ? '#10b981' : '#7c3aee' }} />
              ))}
              <motion.div animate={{ top: ['5%','90%','5%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1 right-1 h-px" style={{ backgroundColor: scanFlash ? '#10b981' : '#7c3aee' }} />
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-[#7c3aee] border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-[11px]">Iniciando cámara…</p>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-red-400 text-xs">{errorMsg}</p>
              <button onClick={startScanner} className="px-3 py-1.5 rounded-lg bg-[#7c3aee] text-white text-xs font-bold">Reintentar</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-800 border-t border-subtle shrink-0 py-1.5">
        <p className="text-center text-[10px] text-muted-400">Apunta el código al recuadro morado</p>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Mobile fullscreen scanner (rendered via Portal)
// ─────────────────────────────────────────────
function MobileScanner({ onScan, onClose }) {
  const elementId = 'gestiva-scanner-mobile'
  const scannerRef = useRef(null)
  const lastScannedRef = useRef({ code: null, time: 0 })
  const mountedRef = useRef(false)

  const [soundOn, setSoundOn] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [scanCount, setScanCount] = useState(0)
  const [scanFlash, setScanFlash] = useState(false)
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.()
        if (state === 2 || state === 3) await scannerRef.current.stop()
        scannerRef.current.clear?.()
      } catch (_) {}
      scannerRef.current = null
    }
  }, [])

  const startScanner = useCallback(async (facing = facingMode) => {
    if (!mountedRef.current) return
    await stopScanner()
    setStatus('loading')
    setErrorMsg('')

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (!mountedRef.current) return

      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner

      // Try exact facingMode first, fall back to any camera
      let started = false
      const configs = [
        { facingMode: { exact: facing } },
        { facingMode: facing },
        { facingMode: 'environment' },
      ]

      for (const camConfig of configs) {
        try {
          await scanner.start(
            camConfig,
            { fps: 10, qrbox: { width: 260, height: 160 }, disableFlip: false },
            (text) => {
              const now = Date.now()
              if (text === lastScannedRef.current.code && now - lastScannedRef.current.time < SCAN_COOLDOWN_MS) return
              lastScannedRef.current = { code: text, time: now }
              if (soundOn) playBeep()
              setScanFlash(true)
              setTimeout(() => setScanFlash(false), 400)
              setScanCount(c => c + 1)
              onScan(text)
            },
            () => {}
          )
          started = true
          break
        } catch (_) { /* try next */ }
      }

      if (!started) throw new Error('Could not start camera with any config')
      if (mountedRef.current) setStatus('ready')
    } catch (err) {
      if (!mountedRef.current) return
      setStatus('error')
      setErrorMsg(buildErrorMsg(err))
    }
  }, [facingMode, soundOn, onScan, stopScanner])

  useEffect(() => {
    mountedRef.current = true
    // Delay to let the portal render and have real DOM dimensions
    const t = setTimeout(() => startScanner(), 150)
    return () => {
      clearTimeout(t)
      mountedRef.current = false
      stopScanner()
    }
  }, []) // eslint-disable-line

  const switchCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    await startScanner(next)
  }

  const toggleFlash = async () => {
    if (!scannerRef.current) return
    try {
      const track = scannerRef.current.getRunningTrack?.()
      if (track) {
        await track.applyConstraints({ advanced: [{ torch: !flashOn }] })
        setFlashOn(f => !f)
      }
    } catch (_) { toast('Flash no disponible') }
  }

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}
    >
      {/* Camera region */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div
          id={elementId}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', minHeight: '100px' }}
        />

        {/* Reticle */}
        {status === 'ready' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: 260, height: 160 }}>
              {[
                { top: 0, left: 0, borderTop: '4px solid', borderLeft: '4px solid', borderRadius: '4px 0 0 0' },
                { top: 0, right: 0, borderTop: '4px solid', borderRight: '4px solid', borderRadius: '0 4px 0 0' },
                { bottom: 0, left: 0, borderBottom: '4px solid', borderLeft: '4px solid', borderRadius: '0 0 0 4px' },
                { bottom: 0, right: 0, borderBottom: '4px solid', borderRight: '4px solid', borderRadius: '0 0 4px 0' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 32, height: 32, borderColor: scanFlash ? '#10b981' : '#7c3aee', ...s }} />
              ))}
              <motion.div
                animate={{ top: ['8%', '88%', '8%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: 8, right: 8, height: 2, background: scanFlash ? '#10b981' : '#7c3aee', opacity: 0.85 }}
              />
            </div>
          </div>
        )}

        {/* Scan count badge */}
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: '6px 12px' }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Escaneados: {scanCount}</span>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, border: '3px solid #7c3aee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#fff', fontSize: 14 }}>Iniciando cámara…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', padding: 24, zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <p style={{ color: '#f87171', fontSize: 14, lineHeight: 1.5 }}>{errorMsg}</p>
              <button
                onClick={() => startScanner()}
                style={{ padding: '8px 20px', background: '#7c3aee', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ background: 'rgba(0,0,0,0.9)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16, flexShrink: 0 }}>
        {/* Close */}
        <button onClick={onClose} style={btnStyle('#dc2626')}>
          <X size={22} color="#fff" />
        </button>
        {/* Flash */}
        <button onClick={toggleFlash} style={btnStyle(flashOn ? '#eab308' : 'rgba(255,255,255,0.12)')}>
          {flashOn ? <Zap size={20} color="#000" /> : <ZapOff size={20} color="#fff" />}
        </button>
        {/* Rotate */}
        <button onClick={switchCamera} style={btnStyle('rgba(255,255,255,0.12)')}>
          <RotateCcw size={18} color="#fff" />
        </button>
        {/* Sound */}
        <button onClick={() => setSoundOn(s => !s)} style={btnStyle(soundOn ? '#7c3aee' : 'rgba(255,255,255,0.12)')}>
          {soundOn ? <Volume2 size={18} color="#fff" /> : <VolumeX size={18} color="rgba(255,255,255,0.4)" />}
        </button>
      </div>

      {/* Spinner animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )

  return createPortal(content, document.body)
}

function btnStyle(bg) {
  return {
    width: 52, height: 52, borderRadius: '50%',
    background: bg, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }
}

function buildErrorMsg(err) {
  const name = err?.name || ''
  const msg = err?.message || ''
  if (name === 'NotAllowedError' || msg.includes('Permission') || msg.includes('ermission')) {
    return 'Permiso denegado. Ve a Ajustes > Safari/Chrome > Cámara y permite el acceso a este sitio.'
  }
  if (name === 'NotFoundError' || msg.includes('camera') || msg.includes('amera')) {
    return 'No se encontró ninguna cámara disponible.'
  }
  if (name === 'NotReadableError' || msg.includes('NotReadable')) {
    return 'La cámara está siendo usada por otra app. Ciérrala e intenta de nuevo.'
  }
  return `Error de cámara: ${msg || name || 'desconocido'}`
}

// ─────────────────────────────────────────────
// Public export — routes to correct sub-component
// ─────────────────────────────────────────────
export default function BarcodeScanner({ onScan, onClose, isMobile = false }) {
  if (isMobile) {
    return <MobileScanner onScan={onScan} onClose={onClose} />
  }
  return <DesktopScanner onScan={onScan} onClose={onClose} />
}
