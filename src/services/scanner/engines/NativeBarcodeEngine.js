import { ScannerEngine } from './ScannerEngine';

export class NativeBarcodeEngine extends ScannerEngine {
  constructor() {
    super('BarcodeDetectorAPI');
    this.detector = null;
  }

  async isSupported() {
    return 'BarcodeDetector' in window;
  }

  async initialize() {
    if (await this.isSupported()) {
      this.detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
      });
    }
  }

  async scan(frame) {
    if (!this.detector || !frame || !frame.canvas) return null;
    
    try {
      const barcodes = await this.detector.detect(frame.canvas);
      if (barcodes.length > 0) {
        return {
          code: barcodes[0].rawValue,
          format: barcodes[0].format,
          engine: this.name
        };
      }
    } catch (err) {
      // Ignorar errores silenciosos del detector (falsos positivos de lectura fallida)
    }
    return null;
  }
}
