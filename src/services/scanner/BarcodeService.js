export class BarcodeService {
  /**
   * Limpia y normaliza el código detectado.
   */
  static normalize(rawCode) {
    if (!rawCode) return null;
    return rawCode.toString().trim().replace(/[^a-zA-Z0-9-]/g, '');
  }

  /**
   * Determina si el código detectado es un formato válido de producto.
   * Útil para filtrar basura o "falsos positivos" que detecten los motores JS.
   */
  static isValidProductCode(code) {
    if (!code) return false;
    
    // Asumimos que los códigos EAN/UPC comunes tienen entre 8 y 14 dígitos numéricos
    // Los Code128 o Code39 pueden tener letras y números.
    const length = code.length;
    
    // Si es demasiado corto (ej. 3 letras), ignorar
    if (length < 4) return false;
    if (length > 40) return false;

    // Validación básica de EAN-13 (solo dígitos y checksum)
    if (/^\d{13}$/.test(code)) {
      return this.validateEan13Checksum(code);
    }
    
    // Si no es un EAN-13 puro, aceptamos cualquier cadena alfanumérica de tamaño razonable
    return /^[a-zA-Z0-9-]+$/.test(code);
  }

  static validateEan13Checksum(code) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code.charAt(i), 10) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = 10 - (sum % 10);
    const calculated = checkDigit === 10 ? 0 : checkDigit;
    return calculated === parseInt(code.charAt(12), 10);
  }
}
