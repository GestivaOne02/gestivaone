/**
 * BarcodeScanner — Cross-platform (iOS Safari, Android Chrome, Desktop)
 *
 * KEY INSIGHT for iOS:
 *   - <video playsInline> MUST be a JSX prop, not set via JavaScript
 *   - getUserMedia must be called from a user-gesture context
 *   - The video element must be in the DOM BEFORE srcObject is assigned
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
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

function buildErrorMsg(err) {
  const n = err?.name || ''
  const m = err?.message || ''
  if (n === 'NotAllowedError' || m.includes('ermission') || m.includes('ermiso')) {
    return 'Acceso denegado. Ir a Ajustes → Safari → Cámara → Permitir gestivaone.com'
  }
  if (n === 'NotFoundError') return 'No se encontró ninguna cámara.'
  if (n === 'NotReadableError') return 'La cámara está en uso por otra app.'
  if (n === 'OverconstrainedError') return 'La cámara no soporta la configuración solicitada.'
  return `Error de cámara: ${m || n || 'desconocido'}`
}

/* ═══════════════════════════════════════════════════════
   MOBILE FULLSCREEN SCANNER  (portal to document.body)
═══════════════════════════════════════════════════════ */
function MobileScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const readerRef = useRef(null)
  const lastRef = useRef({ code: null, time: 0 })
  const mountedRef = useRef(false)

  const [soundOn, setSoundOn] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const [scanCount, setScanCount] = useState(0)
  const [scanFlash, setScanFlash] = useState(false)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const stopAll = useCallback(() => {
    if (readerRef.current) {
      try { readerRef.current.reset() } catch (_) {}
      readerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (!mountedRef.current) return
    stopAll()
    setStatus('loading')
    setErrorMsg('')

    const video = videoRef.current
    if (!video) {
      setTimeout(startCamera, 100)
      return
    }

    // Progressive constraints — iOS often rejects exact facingMode
    const CONSTRAINTS = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ]

    let stream = null
    let lastErr = null
    for (const c of CONSTRAINTS) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c)
        break
      } catch (e) { lastErr = e }
    }

    if (!stream) {
      if (!mountedRef.current) return
      setStatus('error')
      setErrorMsg(buildErrorMsg(lastErr))
      return
    }

    if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return }
    streamRef.current = stream

    // Assign stream — video element already has playsInline/muted/autoPlay in JSX
    video.srcObject = stream

    try {
      await video.play()
    } catch (e) {
      // Some browsers play automatically without this call; ignore the error
    }

    if (!mountedRef.current) return
    setStatus('ready')

    // ── Start zxing continuous decode ──
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/library')
      if (!mountedRef.current) return
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      // Wait for video to have valid dimensions before decoding
      await new Promise(resolve => {
        if (video.videoWidth > 0) return resolve()
        video.addEventListener('loadedmetadata', resolve, { once: true })
        setTimeout(resolve, 2000) // safety fallback
      })

      if (!mountedRef.current) return

      reader.decodeFromVideoElement(video, (result, _err) => {
        if (!result || !mountedRef.current) return
        const code = result.getText()
        const now = Date.now()
        if (code === lastRef.current.code && now - lastRef.current.time < SCAN_COOLDOWN_MS) return
        lastRef.current = { code, time: now }
        if (soundOn) playBeep()
        setScanFlash(true)
        setTimeout(() => setScanFlash(false), 400)
        setScanCount(c => c + 1)
        onScan(code)
      })
    } catch (e) {
      // Decoding library failed — camera is still showing, just no decode
      console.error('Zxing init failed:', e)
    }
  }, [soundOn, onScan, stopAll])

  useEffect(() => {
    mountedRef.current = true
    // Delay to guarantee portal DOM is mounted with real dimensions
    const t = setTimeout(startCamera, 200)
    return () => {
      clearTimeout(t)
      mountedRef.current = false
      stopAll()
    }
  }, []) // eslint-disable-line

  const toggleFlash = async () => {
    if (!streamRef.current) return
    try {
      const track = streamRef.current.getVideoTracks()[0]
      await track.applyConstraints({ advanced: [{ torch: !flashOn }] })
      setFlashOn(f => !f)
    } catch (_) { toast('Flash no disponible') }
  }

  const switchCamera = useCallback(async () => {
    stopAll()
    setStatus('loading')
    // Swap facing mode by checking current track
    await startCamera()
  }, [startCamera, stopAll])

  const ui = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#000', display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── Video element — playsInline MUST be in JSX for iOS ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          playsInline          /* iOS Safari requires this as HTML attribute */
          muted
          autoPlay
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Scan reticle — only when camera is ready */}
        {status === 'ready' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: 260, height: 160 }}>
              {/* Corner markers */}
              {[
                { top: 0,    left: 0,   borderTop: `4px solid`, borderLeft: `4px solid`,  borderRadius: '6px 0 0 0' },
                { top: 0,    right: 0,  borderTop: `4px solid`, borderRight: `4px solid`, borderRadius: '0 6px 0 0' },
                { bottom: 0, left: 0,   borderBottom: `4px solid`, borderLeft: `4px solid`,  borderRadius: '0 0 0 6px' },
                { bottom: 0, right: 0,  borderBottom: `4px solid`, borderRight: `4px solid`, borderRadius: '0 0 6px 0' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 32, height: 32, borderColor: scanFlash ? '#10b981' : '#7c3aee', ...s }} />
              ))}
              {/* Scan line */}
              <motion.div
                animate={{ top: ['8%', '88%', '8%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: 8, right: 8, height: 2, background: scanFlash ? '#10b981' : '#7c3aee' }}
              />
            </div>
          </div>
        )}

        {/* Scan count */}
        {status === 'ready' && (
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: '5px 12px' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Escaneados: {scanCount}</span>
          </div>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'rgba(0,0,0,0.88)' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #7c3aee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
            <p style={{ color: '#fff', fontSize: 15, margin: 0 }}>Iniciando cámara…</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 28, background: 'rgba(0,0,0,0.92)' }}>
            <p style={{ color: '#f87171', fontSize: 15, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>{errorMsg}</p>
            <button onClick={startCamera} style={pillBtn('#7c3aee', '#fff')}>Intentar de nuevo</button>
          </div>
        )}
      </div>

      {/* ── Bottom control bar ── */}
      <div style={{ background: 'rgba(0,0,0,0.88)', padding: '18px 24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexShrink: 0 }}>
        <ActionBtn color="#dc2626" onClick={onClose}><X size={22} color="#fff" /></ActionBtn>
        <ActionBtn color={flashOn ? '#eab308' : 'rgba(255,255,255,0.14)'} onClick={toggleFlash}>
          {flashOn ? <Zap size={20} color="#000" /> : <ZapOff size={20} color="#fff" />}
        </ActionBtn>
        <ActionBtn color="rgba(255,255,255,0.14)" onClick={switchCamera}><RotateCcw size={19} color="#fff" /></ActionBtn>
        <ActionBtn color={soundOn ? '#7c3aee' : 'rgba(255,255,255,0.14)'} onClick={() => setSoundOn(s => !s)}>
          {soundOn ? <Volume2 size={19} color="#fff" /> : <VolumeX size={19} color="rgba(255,255,255,0.35)" />}
        </ActionBtn>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return createPortal(ui, document.body)
}

function ActionBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick} style={{ width: 54, height: 54, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {children}
    </button>
  )
}

function pillBtn(bg, color) {
  return { padding: '10px 24px', background: bg, color, border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }
}

/* ═══════════════════════════════════════════════════════
   DESKTOP SCANNER  (inline inside InvoicePanel flex)
═══════════════════════════════════════════════════════ */
function DesktopScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const readerRef = useRef(null)
  const lastRef = useRef({ code: null, time: 0 })
  const mountedRef = useRef(false)

  const [soundOn, setSoundOn] = useState(true)
  const [scanCount, setScanCount] = useState(0)
  const [scanFlash, setScanFlash] = useState(false)
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const stopAll = useCallback(() => {
    if (readerRef.current) { try { readerRef.current.reset() } catch (_) {} readerRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const startCamera = useCallback(async () => {
    if (!mountedRef.current) return
    stopAll()
    setStatus('loading')
    setErrorMsg('')
    const video = videoRef.current
    if (!video) { setTimeout(startCamera, 100); return }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }))
      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      video.srcObject = stream
      await video.play().catch(() => {})
      if (!mountedRef.current) return
      setStatus('ready')

      const { BrowserMultiFormatReader } = await import('@zxing/library')
      if (!mountedRef.current) return
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader
      await new Promise(r => {
        if (video.videoWidth > 0) return r()
        video.addEventListener('loadedmetadata', r, { once: true })
        setTimeout(r, 2000)
      })
      if (!mountedRef.current) return
      reader.decodeFromVideoElement(video, (result) => {
        if (!result || !mountedRef.current) return
        const code = result.getText()
        const now = Date.now()
        if (code === lastRef.current.code && now - lastRef.current.time < SCAN_COOLDOWN_MS) return
        lastRef.current = { code, time: now }
        if (soundOn) playBeep()
        setScanFlash(true)
        setTimeout(() => setScanFlash(false), 400)
        setScanCount(c => c + 1)
        onScan(code)
      })
    } catch (err) {
      if (!mountedRef.current) return
      setStatus('error')
      setErrorMsg(buildErrorMsg(err))
    }
  }, [soundOn, onScan, stopAll])

  useEffect(() => {
    mountedRef.current = true
    const t = setTimeout(startCamera, 80)
    return () => { clearTimeout(t); mountedRef.current = false; stopAll() }
  }, []) // eslint-disable-line

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-surface-900 overflow-hidden"
    >
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

      <div className="relative bg-black flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />

        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-44 h-28">
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-red-400 text-xs leading-relaxed">{errorMsg}</p>
              <button onClick={startCamera} className="px-3 py-1.5 rounded-lg bg-[#7c3aee] text-white text-xs font-bold">Reintentar</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-800 border-t border-subtle py-1.5 shrink-0">
        <p className="text-center text-[10px] text-muted-400">Apunta al recuadro morado para escanear</p>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   PUBLIC EXPORT
═══════════════════════════════════════════════════════ */
export default function BarcodeScanner({ onScan, onClose, isMobile = false }) {
  if (isMobile) return <MobileScanner onScan={onScan} onClose={onClose} />
  return <DesktopScanner onScan={onScan} onClose={onClose} />
}
