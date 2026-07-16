import { ScannerEngine } from './ScannerEngine';
import Quagga from '@ericblade/quagga2';

export class QuaggaEngine extends ScannerEngine {
  constructor() {
    super('Quagga2');
  }

  async isSupported() {
    return true; // JS engine
  }

  async initialize() {
    // No initialization needed for decodeSingle
  }

  async scan(frame) {
    if (!frame || !frame.canvas) return null;
    
    return new Promise((resolve) => {
      // Decode single takes an image source (like data URI or canvas) 
      // But passing the canvas directly is supported or we can pass data URL
      // Quagga can read from ImageData if configured properly, but passing the canvas to dataURL is reliable if fast enough, 
      // Actually Quagga can read directly from canvas if we pass the context or image data.
      // According to Quagga2 docs, `src` can be a data URL.
      // Let's use toDataURL, which is much faster than toBlob.
      const src = frame.canvas.toDataURL('image/jpeg', 0.8);
      
      Quagga.decodeSingle({
        src: src,
        numOfWorkers: 0,  // Ejecución síncrona en el thread principal para baja latencia en frame por frame
        inputStream: {
          size: 800 // Limitar tamaño de análisis para velocidad
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader', 'upc_e_reader'] 
        },
        locate: true
      }, (result) => {
        if (result && result.codeResult && result.codeResult.code) {
          resolve({
            code: result.codeResult.code,
            format: result.codeResult.format,
            engine: this.name
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async destroy() {
    // Cleanup if needed
  }
}
