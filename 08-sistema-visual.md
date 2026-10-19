# SISTEMA VISUAL UNIFICADO — NEXOCAMPO 2026
**Documento Técnico:** `08-sistema-visual.md`  
**Estado:** Especificación de Identidad Visual, Tokens y Diseño para Android  
**Fase:** Tarea 2 de 5 (Diseño UX/UI, Sistema Visual y Modelo de Datos)  
**Fecha:** 2026-10-18  

---

## 1. Filosofía Visual y Contexto de Campo

NexoCampo 2026 opera bajo una premisa estética clara: **funcionalismo agrícola de alta visibilidad, ergonomía táctil para smartphones Android y sobriedad técnica sin artificios**.

El usuario es un supervisor de cuadrilla en movimiento continuo a la intemperie. Por ende:
- **Cero adornos superfluos:** Sin gradientes púrpuras, sin tarjetas anidadas sin sentido, sin efectos de brillo tipo "cyberpunk" ni micro-etiquetas que saturen la vista.
- **Jerarquía tipográfica unificada:** Una única familia tipográfica (`Plus Jakarta Sans` o sans-serif nativa de Android / `system-ui`) aplicada con variaciones controladas de peso y tamaño.
- **Legibilidad bajo sol directo:** Fondos de alto contraste, separadores nítidos de 1px y modo especializado de "Alto Contraste Solar" (fondos blancos puros y negros sólidos para contrarrestar reflejos).
- **Zonas de confort pulgar (Thumb-zone):** Acciones críticas en el 40% inferior de la pantalla; áreas táctiles nunca inferiores a 44x44px (48x48px en acciones primarias).

---

## 2. Identidad Gráfica y Logotipo Original

### 2.1. Logotipo NexoCampo (Monograma SVG Original)
El logotipo sintetiza dos conceptos fundamentales:
1. **La Espiga / Hoja Agrícola:** Representación vertical de los surcos y el crecimiento vegetal.
2. **El Nodo de Conexión (Nexo):** Puntos de interconexión que simbolizan la supervisión y organización de cuadrillas en campo.

```
       ▲  [Brote verde esmeralda #059669]
      / \
     /   \  [Surco agronómico]
    ●─────● [Nodos de enlace del supervisor]
     \   /
      \ /
       ▼
```

- **Procedencia y Licencia:** Diseño gráfico original vectorizado en SVG embebido en el código, sin uso de marcas comerciales registradas ni tipografías propietarias no autorizadas (cumplimiento Ley 23 de 1982 y Decisión Andina 351).
- **Ubicación:** Extremo superior izquierdo del encabezado universal unificado, acompañado del texto `NexoCampo 2026`.

---

## 3. Paleta Cromática y Tokens Semánticos (Regla 60-30-10)

| Rol del Color | Token Tailwind / Hex | Uso Específico |
| :--- | :--- | :--- |
| **60% Lienzo Neutro (Base)** | `#0f172a` (Slate 900) / `#ffffff` (Modo Sol) | Fondo general, áreas de lectura continua y contenedor de vista. |
| **30% Superficie Estructural** | `#1e293b` (Slate 800) / `#f8fafc` (Slate 50) | Paneles, filas de tabla, bordes de separación (1px `#334155` o `#e2e8f0`). |
| **10% Acento Agrícola** | `#10b981` (Emerald 500) / `#059669` (Emerald 600) | Botones primarios, indicadores de selección activa, foco táctil. |
| **Acento Secundario (Cielo)**| `#0ea5e9` (Sky 500) | Consultas cruzadas, navegación contextual y datos informativos. |
| **Advertencia (Clima/Sol)** | `#f59e0b` (Amber 500) | Condiciones climáticas adversas, justificaciones pendientes, retardos. |
| **Error / Severidad Crítica** | `#ef4444` (Rose 500) | Incidentes de seguridad graves, fallos de guardado local, interrupciones. |

### Regla contra Señalización Únicamente por Color:
Ningún estado se comunica exclusivamente por color. Todo elemento de estado incluye un **ícono representativo y una etiqueta de texto explícita** accesible para personas con daltonismo (WCAG 2.2 criterio 1.4.1).

---

## 4. Tipografía y Escala de Tamaños

Se utiliza una única familia tipográfica sans-serif robusta con números tabulares obligatorios (`tabular-nums`) para cifras, horas y cantidades:

| Nivel Tipográfico | Tamaño (px / rem) | Peso (Weight) | Uso Primario |
| :--- | :--- | :--- | :--- |
| **Encabezado Pantalla** | 18px / 1.125rem | Bold (700) | Título de la vista en curso en la barra superior. |
| **Subtítulo de Sección** | 14px / 0.875rem | SemiBold (600) | Agrupaciones de formularios (e.g. "Condiciones de Labor"). |
| **Cuerpo / Textos** | 13px / 0.8125rem | Regular (400) | Instrucciones, notas del supervisor, descripciones de incidente. |
| **Etiqueta Formulario** | 12px / 0.75rem | Medium (500) | Nombres de campos (labels), tooltips de accesibilidad. |
| **Cifras y Horas** | 16px - 24px (font-mono) | Bold (700) | Tiempos efectivos, cantidades completadas, porcentajes de avance. |
| **Micro-metadatos** | 11px / 0.6875rem | Regular (400) | Separadores inline con punto (`·`), versiones de esquema, marcas UTC. |

---

## 5. Anatomía del Lienzo Principal (Mobile Android)

```
+--------------------------------------------------------------+
| [NC] NEXOCAMPO 2026           [☀️ Sol Campo] [💾 Estado Sync] | <- 52px Sticky Header
+--------------------------------------------------------------+
| [Resumen] [Jornadas] [Labores] [Polisombra] [Asistencia] ... | <- Barra de navegación deslizable
+--------------------------------------------------------------+
|                                                              |
|   ÁREA DE TRABAJO DINÁMICA (Sin desbordamiento horizontal)  |
|                                                              |
|   - Formularios en tarjetas de borde sutil                   |
|   - Botones con superficie mínima 48x48px                    |
|   - Modales en Bottom-Sheet adaptadas al pulgar              |
|                                                              |
+--------------------------------------------------------------+
| [Acción Principal de Guardado / Cierre de Jornada (Sticky)]  | <- Barra inferior si aplica
+--------------------------------------------------------------+
```

### Reglas de Contención Visual:
1. **Cero Scroll Horizontal:** Todos los contenedores usan `w-full max-w-full overflow-hidden`, tablas con desplazamiento interno contenido o tarjetas apiladas en pantallas pequeñas.
2. **Cap del 15% para Elementos Fijos:** El encabezado superior sumado a cualquier barra fija inferior no excede el 15% del alto de la pantalla del teléfono.
3. **Botones de Acción Inequívocos:**
   - *Primario:* Fondo verde esmeralda con texto contrastante blanco (`min-h-[44px]`).
   - *Secundario:* Fondo neutro transparente con borde sutil de 1px.
   - *Advertencia:* Fondo ámbar suave para justificaciones o notas climáticas.
   - *Destructivo:* Borde y texto carmesí con diálogo modal de confirmación obligatoria.
