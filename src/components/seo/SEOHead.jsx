import { useEffect } from 'react'

export default function SEOHead({
  title = 'GestivaOne — Plataforma Comercial e Inteligencia de Negocios en Colombia',
  description = 'Gestión comercial inteligente: facturación electrónica DIAN, control de inventario, POS, cuentas de cobro, reportes financieros y notificaciones automatizadas.',
  canonical = 'https://www.gestivaone.com/',
  ogType = 'website',
  ogImage = 'https://www.gestivaone.com/images/gestivaOneIcon.svg',
  keywords = 'GestivaOne, software POS Colombia, facturación electrónica DIAN, control de inventario, software de gestión comercial, finanzas pymes'
}) {
  useEffect(() => {
    // 1. Update Title
    document.title = title

    // Helper function to update or create meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attrName, attrValue)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Helper function to update or create link tag
    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`)
      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }
      element.setAttribute('href', href)
    }

    // 2. Base Meta Tags
    setMetaTag('name', 'description', description)
    setMetaTag('name', 'keywords', keywords)
    setMetaTag('name', 'robots', 'index, follow')
    setLinkTag('canonical', canonical)

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', canonical)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('property', 'og:site_name', 'GestivaOne')
    setMetaTag('property', 'og:locale', 'es_CO')
    setMetaTag('property', 'og:image', ogImage)

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', ogImage)

    // 5. Schema.org JSON-LD Structured Data
    const schemaData = [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'GestivaOne',
        'operatingSystem': 'Web, Cloud',
        'applicationCategory': 'BusinessApplication',
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'COP',
          'lowPrice': '0',
          'highPrice': '80000',
          'offerCount': '3'
        },
        'description': description,
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'ratingCount': '128'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'GestivaOne',
        'url': 'https://www.gestivaone.com',
        'logo': 'https://www.gestivaone.com/images/gestivaOneIcon.svg',
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+57-304-405-9862',
          'contactType': 'customer service',
          'email': 'soporte@gestivaone.com',
          'areaServed': ['CO', 'LATAM'],
          'availableLanguage': ['Spanish']
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'GestivaOne',
        'url': 'https://www.gestivaone.com/',
        'inLanguage': 'es-CO'
      }
    ]

    let scriptElement = document.getElementById('json-ld-gestiva')
    if (!scriptElement) {
      scriptElement = document.createElement('script')
      scriptElement.id = 'json-ld-gestiva'
      scriptElement.type = 'application/ld+json'
      document.head.appendChild(scriptElement)
    }
    scriptElement.textContent = JSON.stringify(schemaData)

  }, [title, description, canonical, ogType, ogImage, keywords])

  return null
}
