export class ScannerEngine {
  constructor(name) {
    this.name = name;
  }

  /**
   * Verifica si el motor es soportado por el entorno actual.
   */
  async isSupported() {
    return false;
  }

  /**
   * Carga dependencias o instancía configuraciones internas.
   */
  async initialize() {
    // Override
  }

  /**
   * Intenta decodificar el frame proporcionado.
   * @param {Object} frame - { canvas, imageData, width, height }
   * @returns {Promise<{code: string, format: string, engine: string} | null>}
   */
  async scan(frame) {
    return null;
  }

  /**
   * Libera recursos de memoria del motor.
   */
  async destroy() {
    // Override
  }
}
