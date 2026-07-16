# Política de Seguridad DevSecOps

1. **Nunca expongas secretos**:

   - No coloques API Keys, Tokens, Service Role Keys, Passwords ni Connection Strings en Frontend (React, Next.js, Vue, HTML, JS, CSS, VITE_, NEXT_PUBLIC_, etc.).
   - Si se detecta un requisito de clave secreta, la lógica debe moverse automáticamente al backend.
2. **Llamadas sensibles en el servidor**:

   - Frontend -> Backend/API -> Proveedor Externo. El navegador jamás debe conocer la Secret Key.
3. **Variables de entorno**:

   - Usa solo variables de entorno en el backend/edge. Nunca inventes ni hardcodees secretos en el código.
4. **Verificación previa a la generación**:

   - ¿Corre en el navegador? NO accede a secretos.
   - ¿Corre en el servidor? SÍ puede acceder a variables privadas.
5. **Detección de exposición**:

   - Si se detecta una vulnerabilidad o exposición de API Key en el frontend, detén la generación, explícalo al usuario y diseña una arquitectura segura de backend.
6. **Seguridad mínima obligatoria**:

   - Uso de .env, validación de entradas, sanitización, Rate Limiting, CORS, protección CSRF, Logs seguros, HTTPS, cookies HttpOnly. No revelar stack traces en errores.
7. **Revisión OWASP automática**:

   - Prevenir: XSS, SQLi, CSRF, SSRF, Path Traversal, Command Injection, Insecure Direct Object Reference, Filtrado de .env.
8. **Auditoría final**:

   - Al finalizar cualquier modificación o respuesta, incluye un reporte de seguridad verificando la no exposición de secretos.
9. **Mentalidad de Atacante (Red Team)**:

   - Antes de entregar cualquier código, actúa como un atacante.
   - Intenta romper la solución.
   - Encuentra vulnerabilidades en llamadas a API, .env, y datos de clientes.
   - Corrígelas. Solo entonces entrega el código.
