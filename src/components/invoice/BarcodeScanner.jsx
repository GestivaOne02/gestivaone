import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X, ScanLine } from 'lucide-react'
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

function BaseScanner({ onScan, onClose, isMobile, containerId }) {
  const [scanCount, setScanCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [status, setStatus] = useState('loading')
  const lastRef = useRef({ code: null, time: 0 })
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    // Timeout to ensure DOM is ready and animation has settled
    const initTimer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode(containerId)
      html5QrCodeRef.current = html5QrCode

      const config = {
        fps: 15,
        qrbox: isMobile ? { width: 280, height: 180 } : { width: 300, height: 200 },
        aspectRatio: isMobile ? window.innerHeight / window.innerWidth : 1.333334,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      }

      setStatus('loading')
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          const now = Date.now()
          if (decodedText === lastRef.current.code && now - lastRef.current.time < SCAN_COOLDOWN_MS) return
          lastRef.current = { code: decodedText, time: now }
          
          playBeep()
          setScanCount(c => c + 1)
          onScan(decodedText)
        },
        (error) => {
          // Ignored. html5-qrcode fires this every frame it doesn't find a code.
        }
      ).then(() => {
        setStatus('ready')
      }).catch(err => {
        setStatus('error')
        if (err?.name === 'NotAllowedError' || String(err).includes('ermission')) {
          setErrorMsg('Acceso denegado. Ir a Ajustes → Privacidad → Cámara → Permitir')
        } else {
          setErrorMsg(`Error: ${err?.message || err}`)
        }
      })
    }, 300)

    return () => {
      clearTimeout(initTimer)
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear()).catch(() => {})
      } else {
        html5QrCodeRef.current?.clear()
      }
    }
  }, [containerId, isMobile, onScan])

  const ui = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={isMobile ? "fixed inset-0 z-[99999] flex flex-col bg-surface-900 overflow-hidden" : "w-full max-w-sm mx-auto bg-surface-900 border border-subtle overflow-hidden flex flex-col"}
      style={!isMobile ? { borderRadius: 16, height: 400 } : {}}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-subtle bg-surface-800 shrink-0">
        <ScanLine size={14} className="text-brand-400" />
        <span className="text-xs font-bold text-brand-400 flex-1">Escáner Activo</span>
        <span className="text-[10px] text-muted-400 mr-1">Escaneados: {scanCount}</span>
        <button onClick={onClose} className="p-1 rounded-lg text-muted-400 hover:text-danger-400 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="relative bg-black flex-1 flex items-center justify-center overflow-hidden">
        {/* Html5Qrcode target div */}
        <div id={containerId} className="w-full h-full" style={{ overflow: 'hidden' }} />

        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-[#7c3aee] border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-[11px]">Iniciando cámara…</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4 z-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-red-400 text-xs leading-relaxed">{errorMsg}</p>
              <button onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-lg bg-[#7c3aee] text-white text-xs font-bold">Recargar Página</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-800 border-t border-subtle py-1.5 shrink-0 z-20 pb-safe">
        <p className="text-center text-[10px] text-muted-400">Apunta al recuadro para escanear</p>
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
      containerId={isMobile ? "reader-mobile" : "reader-desktop"} 
    />
  )
}
