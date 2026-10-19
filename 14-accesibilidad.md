# ESPECIFICACIÓN DE ACCESIBILIDAD Y AUDITORÍA WCAG 2.2 AA — NEXOCAMPO 2026
**Documento Técnico:** `14-accesibilidad.md`  
**Estado:** Pautas de Inclusión, Usabilidad Solar y Conformidad Técnica  
**Fase:** Tarea 2 de 5 (Diseño UX/UI, Sistema Visual y Modelo de Datos)  
**Fecha:** 2026-10-18  

---

## 1. Compromiso de Accesibilidad Agrícola (WCAG 2.2 Nivel AA)

La accesibilidad en NexoCampo no es un agregado secundario; es la condición fundamental para que un supervisor pueda operar en condiciones ambientales extremas (fatiga visual por sol, uso de guantes, lluvia, vibraciones en vehículos de campo o limitaciones visuales de contraste).

---

## 2. Pautas Técnicas Obligatorias Implementadas

### 2.1. Relaciones de Contraste Cromático (Criterio 1.4.3 y 1.4.11)
- **Texto Normal:** Contraste mínimo de **4.5:1** contra el fondo inmediato.
- **Texto Grande y Controles de Interfaz:** Contraste mínimo de **3:1** contra superficies adyacentes.
- **Modo Sol Campo (Alto Contraste):** Proporciona un ratio superior a **12:1** (negro puro `#000000` sobre blanco absoluto `#ffffff` con bordes `#334155`), diseñado para neutralizar el deslumbramiento solar en campo abierto.

### 2.2. No Dependencia Exclusiva del Color (Criterio 1.4.1)
- Todo indicador de estado (éxito, advertencia, error, incompleto, sin registrar) combina:
  1. Color semántico de fondo y texto.
  2. Ícono vectorial unívoco (`CheckCircle2`, `AlertTriangle`, `Clock`, `Minus`, `XCircle`).
  3. Texto explicativo legible (`"Cumple"`, `"No cumple"`, `"Pendiente Justificación"`, `"Sin Registrar"`).

### 2.3. Dimensiones de Objetivos Táctiles (Criterio 2.5.8 Target Size)
- Ningún botón, celda de lista, enlace o casilla de verificación tiene un objetivo táctil interactivo inferior a **$44 \times 44\text{px}$**.
- Las acciones críticas de guardado y navegación inferior disponen de una altura de **$48\text{px}$** a **$52\text{px}$** para facilitar la pulsación con el pulgar.
- Espaciado mínimo de $8\text{px}$ entre controles contiguos para evitar falsos toques.

### 2.4. Foco Visible y Navegación por Teclado (Criterio 2.4.7 y 2.4.11)
- Todos los elementos interactivos cuentan con un anillo de foco visible de alto contraste:
  `focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none`.
- El orden del tabulador (`Tab`, `Shift+Tab`, flechas) sigue estrictamente el flujo visual lógico de lectura.

### 2.5. Etiquetas Accesibles y Semántica HTML5 Nativa (Criterios 1.3.1 y 4.1.2)
- Uso preferente de elementos semánticos nativos (`<button>`, `<input>`, `<label>`, `<dialog>`, `<nav>`, `<main>`) en lugar de `<div>` clickeables sin rol.
- Toda entrada de formulario cuenta con un `<label>` explícito asociado o un atributo `aria-label` descriptivo (e.g. `aria-label="Marcar asistencia para J. Pérez el día Lunes"`).

---

## 3. Matriz de Verificación de Formularios para Lectores de Pantalla

| Componente | Rol ARIA / Etiqueta | Comportamiento Accesible |
| :--- | :--- | :--- |
| **Pase de Lista Matutino** | `role="grid"` con celdas `role="gridcell"` | El lector anuncia: *"Colaborador COL-001, Lunes: Sin registrar. Presione Espacio o Toque para cambiar a Presente."* |
| **Condiciones Ambientales** | `role="group"` con `aria-label="Condiciones de labor"` | Casillas accesibles con `aria-checked="true/false"`. |
| **Modal Justificación** | `role="dialog"` con `aria-labelledby` | Atrapa el foco al abrirse y lo devuelve al control detonante al cerrarse (`ESC` cierra el modal). |
| **Avisos de Guardado** | `role="status"` o `aria-live="polite"` | Los mensajes de confirmación se anuncian inmediatamente sin interrumpir la voz en curso. |

---

## 4. Pruebas de Estrés Accesible Realizadas

1. **Prueba de Reducción de Movimiento (`prefers-reduced-motion: reduce`):**  
   Las transiciones y modales desactivan traslaciones complejas y pasan a transiciones de opacidad instantáneas para evitar mareos o distracciones.
2. **Prueba de Zoom al 200% (Reflow):**  
   La interfaz se adapta sin que se produzca desplazamiento horizontal ni recorte de textos en viewports móviles ampliados.
3. **Prueba de Modo Sol Campo:**  
   Verificada en simulación de alta iluminancia ambiental, manteniendo legibilidad nítida en todos los controles operativos.
