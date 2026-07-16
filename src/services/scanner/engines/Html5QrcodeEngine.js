import { ScannerEngine } from './ScannerEngine';
import { Html5Qrcode } from 'html5-qrcode'; 

export class Html5QrcodeEngine extends ScannerEngine {
  constructor() {
    super('Html5Qrcode');
    this.scanner = null;
  }

  async isSupported() {
    return true; 
  }

  async initialize() {
    if (!document.getElementById('hidden-html5-qrcode-div')) {
      const div = document.createElement('div');
      div.id = 'hidden-html5-qrcode-div';
      div.style.display = 'none';
      document.body.appendChild(div);
    }
    this.scanner = new Html5Qrcode("hidden-html5-qrcode-div", false);
  }

  async scan(frame) {
    if (!this.scanner || !frame || !frame.canvas) return null;
    
    // Convertir el Canvas actual a un File/Blob para inyectarlo al scanner
    // (Html5Qrcode expone scanFileV2 para archivos estáticos)
    return new Promise((resolve) => {
      frame.canvas.toBlob(async (blob) => {
        if (!blob) return resolve(null);
        
        const file = new File([blob], "frame.jpg", { type: "image/jpeg" });
        try {
          const result = await this.scanner.scanFileV2(file, false);
          if (result && result.decodedText) {
            resolve({
              code: result.decodedText,
              format: result.result?.format?.formatName || 'UNKNOWN',
              engine: this.name
            });
          } else {
            resolve(null);
          }
        } catch (err) {
          resolve(null);
        }
      }, 'image/jpeg', 0.8);
    });
  }

  async destroy() {
    try {
      if (this.scanner) {
        this.scanner.clear();
      }
    } catch(e) {}
  }
}
