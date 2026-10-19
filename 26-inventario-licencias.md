# 26 — Inventario de Propiedad Intelectual, Activos y Licencias de Terceros
## NexoCampo 2026 — Supervisión Agrícola Offline-First

**Marco Normativo de Referencia:**
- Decisión Andina 351 de 1993 (Régimen Común sobre Derecho de Autor y Conexos en la Comunidad Andina).
- Ley 23 de 1982 de la República de Colombia sobre Derechos de Autor.
- Principios internacionales de licenciamiento Open Source (OSI) y dominio público.

---

### 1. Activos Gráficos Propios y Procedencia de Identidad

| Activo Gráfico | Ruta de Archivo | Procedencia / Origen | Tipo de Licencia / Uso | Justificación Legal |
| :--- | :--- | :--- | :--- | :--- |
| **Logotipo NexoCampo 2026** | `/public/icon.svg`, `/icon.svg` | Creación vectorial original para el proyecto experimental (combinación de surcos agrícolas, espiga estilizada y nodo geométrico de datos). | Licencia Interna de Proyecto Experimental (Apache 2.0). | No copia, imita ni reproduce signos distintivos o marcas comerciales registradas de terceros en la industria agropecuaria. |
| **Iconos PNG PWA** | `/public/pwa-192x192.png`, `512x512`, `apple-touch-icon.png` | Renders matriciales generados a partir del SVG vectorial original mediante script de Node.js (`scripts/generate-icons.mjs`). | Derivado del logotipo original (Apache 2.0). | Sin dependencias de bibliotecas propietarias externas. |

---

### 2. Tipografías y Fuentes del Sistema Visual

| Familia Tipográfica | Uso en la Aplicación | Procedencia / Fuente | Licencia | Observaciones |
| :--- | :--- | :--- | :--- | :--- |
| **System UI Native Stack** (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) | Toda la interfaz de usuario móvil y escritorio | Pila de fuentes nativas del sistema operativo del dispositivo cliente (Android, iOS, Windows, Linux). | Licencia de Sistema Operativo del Usuario Final. | No requiere descarga remota de Google Fonts ni paquetes de fuentes en runtime, lo que asegura: 1) Cero peticiones de red externas, 2) 100% de cumplimiento offline, 3) Cero riesgo de infracción de copyright tipográfico. |

---

### 3. Iconografía de Interfaz de Usuario

| Biblioteca de Iconos | Proveedor / Autor | Versión | Licencia | Aviso de Copyright |
| :--- | :--- | :--- | :--- | :--- |
| **Lucide React** (`lucide-react`) | Proyecto Lucide Contributors | `^1.16.0` | **ISC License** (Permisiva, equivalente a MIT) | Copyright (c) Lucide Project. Permite uso comercial, modificación, copia y distribución libre de regalías. |

---

### 4. Inventario de Dependencias de Software (NPM Runtime y Dev)

Todas las dependencias instaladas en `package.json` han sido auditadas para verificar compatibilidad de licencias con aplicaciones empresariales:

| Paquete NPM | Versión Declarada | Propósito Técnico | Licencia SPDX | Compatible con Uso Empresarial |
| :--- | :--- | :--- | :--- | :--- |
| `react` | `^19.0.0` | Biblioteca base de interfaz de usuario | **MIT** | Sí |
| `react-dom` | `^19.0.0` | Renderizador DOM para React | **MIT** | Sí |
| `lucide-react` | `^1.16.0` | Iconos vectoriales de interfaz de usuario | **ISC** | Sí |
| `express` | `^4.21.2` | Servidor backend para sincronización `/api/sync` | **MIT** | Sí |
| `vite` | `^6.2.0` | Bundler y servidor de desarrollo para SPA | **MIT** | Sí (Herramienta de compilación) |
| `@vitejs/plugin-react` | `^4.3.4` | Integración Fast Refresh de React en Vite | **MIT** | Sí |
| `@tailwindcss/vite` | `^4.0.0` | Compilador de estilos CSS utilitarios | **MIT** | Sí |
| `tailwindcss` | `^4.0.0` | Motor de estilos de alto rendimiento | **MIT** | Sí |
| `typescript` | `~5.7.2` | Compilador y verificador estático de tipos | **Apache-2.0** | Sí |

---

### 5. Servicios de Inteligencia Artificial y Herramientas de Asistencia

- **Uso en Desarrollo:** Las directrices y código modular fueron estructurados en el entorno de desarrollo asistido de Google AI Studio Build.
- **Régimen de Términos:** El código fuente resultante es de libre disposición para el usuario, sin regalías ni gravámenes propietarios sobre la lógica de negocio agrícola implementada.
- **Integraciones en Runtime:** El prototipo cliente NexoCampo 2026 **no incluye llamadas activas a LLMs ni APIs de IA en producción**, garantizando que no se transfieran datos de cuadrillas agrícolas a servicios externos de inferencia.

---

### 6. Declaración de Limitación de Responsabilidad Legal
El presente inventario no constituye un dictamen jurídico vinculante ni una certificación formal expedida por la Dirección Nacional de Derecho de Autor (DNDA) de Colombia. Cualquier despliegue productivo a gran escala debe someterse a la revisión formal de la asesoría legal corporativa de la organización contratante.
