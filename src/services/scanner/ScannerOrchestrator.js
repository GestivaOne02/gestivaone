import { BarcodeService } from './BarcodeService';

export class ScannerOrchestrator {
  constructor(cameraService) {
    this.cameraService = cameraService;
    this.engines = [];
    this.isRunning = false;
    this.animationFrameId = null;
    this.onResult = null;
    this.lastProcessTime = 0;
    this.fpsLimit = 10;
    
    // Métricas
    this.metrics = {
      startTime: 0,
      framesProcessed: 0,
      enginesCalled: 0
    };
  }

  addEngine(engine) {
    this.engines.push(engine);
  }

  async start(onResultCallback) {
    this.onResult = onResultCallback;
    this.isRunning = true;
    this.metrics.startTime = Date.now();
    this.metrics.framesProcessed = 0;
    this.metrics.enginesCalled = 0;

    // Inicializar motores soportados
    for (const engine of this.engines) {
      if (await engine.isSupported()) {
        try {
          await engine.initialize();
        } catch (e) {
          console.warn(`[Orchestrator] Error initializing engine ${engine.name}`, e);
        }
      }
    }

    this.processFrame();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Liberar memoria de los motores
    for (const engine of this.engines) {
      engine.destroy().catch(()=> { /* ignore */ });
    }
  }

  async processFrame() {
    if (!this.isRunning) return;

    const now = Date.now();
    const timeToWait = 1000 / this.fpsLimit;

    if (now - this.lastProcessTime >= timeToWait) {
      this.lastProcessTime = now;
      const frame = this.cameraService.getFrame();

      if (frame) {
        this.metrics.framesProcessed++;
        const elapsed = Date.now() - this.metrics.startTime;
        
        // Ejecución en Cascada (Fallback Chain)
        for (const engine of this.engines) {
          // Optimization: If it's a slow engine (like OCR or blob-based JS), 
          // wait until 1.5 seconds have passed before burning CPU.
          if (engine.name !== 'BarcodeDetectorAPI' && elapsed < 1500) {
            continue; 
          }

          this.metrics.enginesCalled++;
          const t0 = performance.now();
          try {
            const result = await engine.scan(frame);
            const t1 = performance.now();
            
            if (result && result.code && BarcodeService.isValidProductCode(result.code)) {
              result.code = BarcodeService.normalize(result.code);
              result.processingTimeMs = t1 - t0;
              console.log(`[Orchestrator] Detectado por ${result.engine} en ${result.processingTimeMs.toFixed(2)}ms`);
              
              if (this.onResult) {
                this.onResult(result);
              }
              this.stop();
              return; 
            }
          } catch (e) {
            // Falla el motor, pasamos al siguiente en la cadena
          }
        }
      }
    }

    // Siguiente frame
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(() => this.processFrame());
    }
  }
}
