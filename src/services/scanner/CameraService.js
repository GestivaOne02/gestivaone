export class CameraService {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d', { willReadFrequently: true });
    this.isActive = false;
  }

  async start(videoRef) {
    if (this.isActive && this.stream) return;
    
    this.videoElement = videoRef;

    try {
      // Intentar obtener la cámara con resolución controlada y autofocus
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          advanced: [{ focusMode: "continuous" }]
        },
        audio: false
      });

      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.muted = true;
      
      await this.videoElement.play();
      this.isActive = true;
      
      // Sincronizar canvas con tamaño real del video (o de la zona de interés)
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
      
      console.log(`[CameraService] Started: ${this.canvas.width}x${this.canvas.height}`);
    } catch (err) {
      console.error('[CameraService] Error starting camera', err);
      throw err;
    }
  }

  getFrame() {
    if (!this.isActive || !this.videoElement) return null;
    
    // Actualizar dimensiones por si el dispositivo rota
    if (this.canvas.width !== this.videoElement.videoWidth) {
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
    }

    // Dibujar fotograma en canvas
    this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    
    // Retornar ImageData para procesadores (como ZXing/Html5Qrcode que no puedan usar el canvas directamente)
    // O retornar el canvas mismo para BarcodeDetector
    return {
      canvas: this.canvas,
      imageData: this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  stop() {
    this.isActive = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    console.log('[CameraService] Stopped');
  }
}
