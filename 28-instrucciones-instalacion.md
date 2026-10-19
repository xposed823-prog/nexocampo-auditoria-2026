# 28 — Instrucciones de Instalación, Ejecución y Procedimiento de Pruebas
## NexoCampo 2026 — Supervisión Agrícola Offline-First

---

### 1. Requisitos Previos del Sistema

- **Node.js:** Versión 20.x o 22.x LTS instalada (`node -v`).
- **NPM / Bun:** Gestor de paquetes compatible.
- **Navegador Web:** Google Chrome / Chromium versión 110+, Microsoft Edge o Mozilla Firefox con soporte para Service Workers, IndexedDB y Web App Manifests.
- **Terminal:** Bash / Zsh en Linux, macOS o WSL2 en Windows.

---

### 2. Estructura Definitiva del Proyecto

```text
nexocampo-2026/
├── 01-diagnostico.md a 22-casos-prueba-matematicos.md   # Documentación Tareas 1, 2 y 3
├── 23-informe-auditoria.md a 32-resumen-entrega.md     # Documentación Tarea 5 (Auditoría)
├── manifest.json                                      # Manifiesto Web App PWA raíz
├── index.html                                         # Entrypoint HTML con metadatos PWA
├── offline.html                                       # Pantalla contingente sin conexión
├── service-worker.js                                  # Service Worker raíz (Cache + Sync)
├── server.js                                          # Backend Express con /api/sync
├── css/
│   └── style.css                                      # Hoja de estilos agrícolas 60-30-10
├── js/
│   ├── db.js                                          # Motor IndexedDB y cola Outbox
│   └── app.js                                         # Controlador PWA cliente
├── public/                                            # Directorio estático servido por Vite
│   ├── manifest.json
│   ├── offline.html
│   ├── service-worker.js
│   ├── icon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   ├── apple-touch-icon.png
│   ├── css/style.css
│   └── js/ (app.js, db.js)
├── src/
│   ├── App.tsx                                        # Interfaz React con navegación de 14 pestañas
│   ├── main.tsx                                       # Inicializador React
│   └── domain/                                        # Capa de Dominio Puro (Sin dependencias UI)
│       ├── jornadaCalculator.ts                       # Motor de tiempos de jornada
│       ├── rendimientoCalculator.ts                   # Motor de rendimiento y cantidades
│       ├── businessRulesEngine.ts                     # Reglas de negocio y solapamiento
│       ├── formValidators.ts                          # Validadores de formularios de campo
│       ├── pwaManager.ts                              # Conector de sincronización PWA
│       ├── usePWAInstall.ts                           # Hook de instalación de pantalla de inicio
│       ├── calculators.test.ts                        # Pruebas de jornadas y rendimiento
│       ├── formsAndData.test.ts                       # Pruebas de validación de formularios
│       ├── businessRulesEngine.test.ts                # Pruebas de 16 casos de negocio
│       ├── pwaQueue.test.ts                           # Pruebas de cola y batches PWA
│       └── auditSuite.test.ts                         # Suite exhaustiva de auditoría Tarea 5
├── package.json                                       # Dependencias y scripts de ejecución
├── tsconfig.json                                      # Configuración TypeScript
└── vite.config.ts                                     # Configuración de bundler y middleware /api
```

---

### 3. Instrucciones de Inicio del Prototipo

#### Paso 1: Instalación de Dependencias
```bash
npm install
```

#### Paso 2: Ejecución del Servidor de Desarrollo
```bash
npm run dev
```
La aplicación quedará disponible en:
```text
http://localhost:3000
```

#### Paso 3: Ejecución en Modo Producción / Servidor Full-Stack
Para ejecutar el servidor Express de sincronización junto con la aplicación construida:
```bash
npm run build
node server.js
```

---

### 4. Procedimiento de Ejecución de Pruebas Automatizadas

NexoCampo cuenta con 46 pruebas unitarias y de dominio ejecutadas directamente por el test runner nativo de Node.js v22 (`node:test`), sin necesidad de herramientas pesadas de terceros.

#### Ejecutar Todas las Pruebas de Dominio y Auditoría
```bash
node --test src/domain/*.test.ts
```
**Salida Esperada:**
```text
# tests 46
# suites 0
# pass 46
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

#### Ejecutar Exclusivamente la Suite de Auditoría de la Tarea 5
```bash
node --test src/domain/auditSuite.test.ts
```

#### Ejecutar Verificación Estática de Tipos TypeScript (Linting)
```bash
npm run lint
```

---

### 5. Procedimiento para Evaluar la Experiencia PWA y Modo Offline

1. Abrir la aplicación en Google Chrome: `http://localhost:3000`.
2. Abrir las herramientas de desarrollo (**F12** o **Ctrl + Shift + I**).
3. Ir a la pestaña **Application** (Aplicación) y verificar:
   - **Manifest:** Comprobar nombre, iconos PNG y modo `standalone`.
   - **Service Workers:** Verificar estado `activated and is running` para `/service-worker.js`.
   - **IndexedDB:** Expandir `NexoCampoPWA_DB` y comprobar los almacenes de objetos.
4. Ir a la pestaña **Network** (Red) y seleccionar **Offline** en el selector de throttling.
5. Llenar y guardar un registro en el formulario de **Plástico & Malla** o en la pestaña **PWA & Sync Offline**:
   - Comprobar que el registro se guarda de inmediato con notificación: *"✓ Registro guardado en IndexedDB local seguro"*.
   - El contador en la cabecera cambiará a **1 pend.** con color ámbar.
6. Volver a activar la red (**No throttling** u **Online**):
   - El Service Worker o el listener de conectividad detectará el regreso de señal y procesará la cola con el endpoint `/api/sync`.
   - Se disparará la confirmación automática con sonido/vibración y notificación al usuario.
