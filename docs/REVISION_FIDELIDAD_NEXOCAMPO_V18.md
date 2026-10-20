# REVISIÓN Y AUDITORÍA VISUAL/FUNCIONAL (/review)
**NexoCampo PRO v18.1.9 vs. Aplicativo Alterno**  
**Fecha:** 20 de Octubre de 2026  
**Entorno de Inspección:** Captura real de pantalla en emulador Playwright Chromium (Mobile Android 412×892 px y Desktop 1280×800 px)

---

## 1. Veredicto del Sistema de Inspección Visual
**Estado de la revisión:** `DEFECTS_FOUND` (Observaciones visuales y de fidelidad registradas para corrección).

### Defectos Visuales Identificados en la Captura en Vivo (`mobile_view.png`):
1. **[Prioridad Media] Pie de Página de Métricas Desalineado (`Footer Metric Strip`):**
   - En la tarjeta de pie (`NexoCampo PRO v18.1.9`), el texto de áreas queda truncado (`Áreas: Jamaica · Piloto ·`), y los contadores numéricos `36` y `23` aparecen flotando sin etiquetas de contexto visibles legibles ni alineación CSS consistente (`display: flex; justify-content: space-between` desfasado).
   - *Solución requerida:* Envolver las métricas del pie en un grid o flex row explícito con `min-width: 0`, etiquetas claras (`36 Colaboradores`, `23 Labores precargadas`) y truncado `text-ellipsis` seguro.
2. **[Prioridad Baja] Glifo o Carácter Especial en Barra de Pestañas:**
   - La pestaña `🛜 PWA & Sync Offline` presenta un carácter que puede fallar o mostrarse con caja vacía/glifo roto en navegadores antiguos de Android/WebView.
   - *Solución requerida:* Utilizar SVG o componente de icono estándar (Lucide/Heroicons) en vez de emojis Unicode directos.

---

## 2. Diagnóstico de Fidelidad Frente al Original (`index.html` v18.1.9)

### A. Elementos con 100% de Coincidencia Confirmada
* **Catálogo de Colaboradores (36/36):** Anderson Cortes Mendez hasta Yesilver Alexander Arango.
* **Catálogo de Labores (23/23):** Todas las labores presentes con sus unidades (`túnel`, `estopa`, `lateral`, etc.), modelos (`individual`, `grupal_tiempo`, `grupal_meta`, `tiempo`), y valores críticos respetados (`Empacar compost: 1.71 min`, `Maquinaria: null min`).
* **Catálogo Territorial (4 Áreas):**
  * Jamaica: T5 (3 túneles), T6 (7 túneles), T7 (5 túneles), T8 (4 túneles), T9 (5 túneles) + Común.
  * Piloto: T1 a T4 (6 túneles cada uno) + Común.
  * Púrpura: Bloques A a H (6 túneles cada uno) + Común.
  * Naranja: Bloques I, J, K, L, N (6 túneles cada uno, sin bloques M) + Común.
* **Jornada Canónica:** 06:30 a 15:30 (475 min netos L-V) y 06:30 a 13:00 (360 min sábados).

### B. Desviaciones Detectadas Frente a la Experiencia Original de Campo
1. **Estructura de Navegación:**
   - *Original:* 6 secciones canónicas en barra inferior (`Inicio`, `Registrar`, `Reportes`, `Ausencias`, `Asistencia`, `Admin`).
   - *Alterno actual:* Barra superior con pestañas horizontales (`1. Resumen`, `PWA & Sync`, `2. Jornadas`, `3. Labores`, etc.).
2. **Esquema Cromático:**
   - *Original:* Tema claro dominante (`#f1f5f9` / `#ffffff`) optimizado para luz solar directa en campo.
   - *Alterno actual:* Tema oscuro dominante (`#0f172a`) con botón de alternancia a modo sol.
3. **Módulos Ajenos al Flujo Nuclear:**
   - En el alterno actual se agregaron pestañas como "Incidentes SST", "Casos Matemáticos" o "Docs Tarea" en primer nivel de navegación, cuando el original concentra todo en el flujo de jornada y administración.

---

## 3. Matriz de Hallazgos y Priorización

| Elemento | Estado Original | Estado Alterno | Severidad | Acción Propuesta |
| :--- | :--- | :--- | :--- | :--- |
| **Navegación** | 6 Vistas en Bottom Nav | 15 Pestañas superiores | ALTO | Reestructurar a las 6 vistas canónicas de NexoCampo. |
| **Persistencia IDB** | DB `nexocampo` v4 (6 almacenes) | DB parcial en memoria | CRÍTICO | Conectar todos los módulos al motor IndexedDB v4. |
| **Pie de Página** | Compacto y alineado | Texto truncado y métricas desalineadas | MEDIO | Corregir estilos del footer con flexbox responsive. |
| **Flujo de Registro** | Jornada unificada con tramos múltiples | Formularios fragmentados por labor | ALTO | Unificar registro de labores y eventos en un solo flujo. |

---

## 4. Próximo Paso
El diagnóstico de solo lectura y revisión visual ha concluido. Queda listo para iniciar la **Fase 2.1 (Persistencia Canónica IndexedDB v4)** cuando usted lo indique.
