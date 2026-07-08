/**
 * Servicio de Localización e Internacionalización (i18n) - GestivaOne
 * 
 * Centraliza las configuraciones tributarias, impositivas y de identificación
 * para los países soportados en Latinoamérica y otras regiones.
 */

export const COUNTRIES_CONFIG = {
  CO: {
    id: 'CO',
    name: 'Colombia',
    currency: 'COP',
    defaultTaxRate: 0.19, // IVA 19%
    taxLabel: 'IVA',
    documentTypes: [
      { label: 'Cédula de Ciudadanía (CC)', value: '13' },
      { label: 'NIT (Identificación Tributaria)', value: '31' },
      { label: 'Cédula de Extranjería (CE)', value: '22' },
      { label: 'Pasaporte', value: '41' }
    ],
    placeholderDoc: 'Ej: 1.020.304.050 o 900.123.456-7',
    retentions: [
      { id: 'retefuente_compras', name: 'Retefuente (Compras - 2.5%)', rate: 0.025, type: 'fixed' },
      { id: 'reteica', name: 'ReteICA (9.66/1000)', rate: 0.00966, type: 'fixed' }
    ]
  },
  MX: {
    id: 'MX',
    name: 'México',
    currency: 'MXN',
    defaultTaxRate: 0.16, // IVA 16%
    taxLabel: 'IVA',
    documentTypes: [
      { label: 'RFC', value: 'RFC' },
      { label: 'CURP', value: 'CURP' },
      { label: 'INE', value: 'INE' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: XAXX010101000 o CURP',
    retentions: []
  },
  US: {
    id: 'US',
    name: 'Estados Unidos',
    currency: 'USD',
    defaultTaxRate: 0.0, // TAX 0% base
    taxLabel: 'TAX',
    documentTypes: [
      { label: 'SSN', value: 'SSN' },
      { label: 'EIN', value: 'EIN' },
      { label: 'ITIN', value: 'ITIN' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: 12-3456789 o SSN',
    retentions: []
  },
  ES: {
    id: 'ES',
    name: 'España',
    currency: 'EUR',
    defaultTaxRate: 0.21, // IVA 21%
    taxLabel: 'IVA',
    documentTypes: [
      { label: 'NIF', value: 'NIF' },
      { label: 'NIE', value: 'NIE' },
      { label: 'DNI', value: 'DNI' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: 12345678A',
    retentions: []
  },
  AR: {
    id: 'AR',
    name: 'Argentina',
    currency: 'ARS',
    defaultTaxRate: 0.21, // IVA 21%
    taxLabel: 'IVA',
    documentTypes: [
      { label: 'DNI', value: 'DNI' },
      { label: 'CUIT', value: 'CUIT' },
      { label: 'CUIL', value: 'CUIL' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: 20-12345678-9',
    retentions: []
  },
  CL: {
    id: 'CL',
    name: 'Chile',
    currency: 'CLP',
    defaultTaxRate: 0.19, // IVA 19%
    taxLabel: 'IVA',
    documentTypes: [
      { label: 'RUT', value: 'RUT' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: 12.345.678-9',
    retentions: []
  },
  PE: {
    id: 'PE',
    name: 'Perú',
    currency: 'PEN',
    defaultTaxRate: 0.18, // IGV 18%
    taxLabel: 'IGV',
    documentTypes: [
      { label: 'DNI', value: 'DNI' },
      { label: 'RUC', value: 'RUC' },
      { label: 'Cédula Extranjería (CE)', value: 'CE' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: 20123456789 o DNI',
    retentions: []
  },
  CR: {
    id: 'CR',
    name: 'Costa Rica',
    currency: 'CRC',
    defaultTaxRate: 0.13, // IVA 13%
    taxLabel: 'IVA',
    documentTypes: [
      { label: 'Cédula Física', value: 'CEDULA' },
      { label: 'DIMEX', value: 'DIMEX' },
      { label: 'NITE', value: 'NITE' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: Cédula Física o Jurídica',
    retentions: []
  },
  DO: {
    id: 'DO',
    name: 'República Dominicana',
    currency: 'DOP',
    defaultTaxRate: 0.18, // ITBIS / IVA 18%
    taxLabel: 'ITBIS',
    documentTypes: [
      { label: 'Cédula', value: 'CEDULA' },
      { label: 'RNC', value: 'RNC' },
      { label: 'Pasaporte', value: 'PAS' }
    ],
    placeholderDoc: 'Ej: RNC o Cédula Dominicana',
    retentions: []
  }
}

/**
 * Obtiene la configuración de localización de un país por su código de país.
 * @param {string} countryCode Código ISO del país (ej. 'CO', 'MX')
 * @returns {object} Configuración del país. Si no existe, retorna la de Colombia por defecto.
 */
export function getLocalizationByCountry(countryCode) {
  const code = (countryCode || 'CO').trim().toUpperCase()
  return COUNTRIES_CONFIG[code] || COUNTRIES_CONFIG.CO
}

/**
 * Obtiene la configuración de localización de un país por su tipo de moneda base.
 * @param {string} currencyCode Código de moneda (ej. 'COP', 'MXN', 'USD')
 * @returns {object} Configuración del país correspondiente.
 */
export function getLocalizationByCurrency(currencyCode) {
  const code = (currencyCode || 'COP').trim().toUpperCase()
  const matched = Object.values(COUNTRIES_CONFIG).find(c => c.currency === code)
  return matched || COUNTRIES_CONFIG.CO
}

/**
 * Formatea un valor numérico a la moneda local especificada.
 * @param {number} value Valor numérico a formatear
 * @param {string} currencyCode Código de moneda (ej. 'COP', 'USD')
 * @returns {string} Texto formateado (ej. "$120.000 COP")
 */
export function formatCurrency(value, currencyCode) {
  const code = (currencyCode || 'COP').trim().toUpperCase()
  const matched = Object.values(COUNTRIES_CONFIG).find(c => c.currency === code)
  const lang = matched?.language || (code === 'USD' ? 'en-US' : 'es-CO')
  
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'COP' || code === 'CLP' ? 0 : 2
    }).format(value)
  } catch (e) {
    return `${code} ${Number(value).toFixed(2)}`
  }
}
