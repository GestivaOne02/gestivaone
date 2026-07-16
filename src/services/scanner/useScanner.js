import { useEffect, useRef, useState } from 'react';
import { CameraService } from './CameraService';
import { ScannerOrchestrator } from './ScannerOrchestrator';
import { NativeBarcodeEngine } from './engines/NativeBarcodeEngine';
import { QuaggaEngine } from './engines/QuaggaEngine';
import { Html5QrcodeEngine } from './engines/Html5QrcodeEngine';

export function useScanner(onResult) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  
  const orchestratorRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        if (!videoRef.current) return;
        setStatus('loading');

        // 1. Iniciar Camera Service
        const camera = new CameraService();
        cameraRef.current = camera;
        await camera.start(videoRef.current);

        // 2. Iniciar Orquestador
        const orchestrator = new ScannerOrchestrator(camera);
        
        // 3. Registrar Motores (El orden importa para la Cascada de Fallback)
        // Primero NativeBarcodeEngine (Latencia de ~10ms, Cero CPU overhead)
        orchestrator.addEngine(new NativeBarcodeEngine());
        
        // Segundo QuaggaEngine (Especializado en EAN/1D en JS puro, super rápido)
        orchestrator.addEngine(new QuaggaEngine());

        // Tercero Html5QrcodeEngine (WASM/JS fallback pesado para QRs)
        orchestrator.addEngine(new Html5QrcodeEngine()); 

        orchestratorRef.current = orchestrator;

        // 4. Iniciar Escaneo
        orchestrator.start((result) => {
          if (isMounted && onResult) {
            onResult(result.code);
          }
        });

        if (isMounted) setStatus('ready');
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        if (err?.name === 'NotAllowedError' || String(err).includes('ermission')) {
          setErrorMsg('Acceso denegado. Permite la cámara en Ajustes del Navegador.');
        } else {
          setErrorMsg(`Error iniciando cámara: ${err.message || err}`);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (orchestratorRef.current) {
        orchestratorRef.current.stop();
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onResult]);

  return { videoRef, status, errorMsg };
}
