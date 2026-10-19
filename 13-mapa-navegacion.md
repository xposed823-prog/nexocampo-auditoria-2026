# MAPA DE NAVEGACIÓN Y ARQUITECTURA DE INFORMACIÓN — NEXOCAMPO 2026
**Documento Técnico:** `13-mapa-navegacion.md`  
**Estado:** Especificación de Rutas, Jerarquía de Vistas y Navegación Móvil Android  
**Fase:** Tarea 2 de 5 (Diseño UX/UI, Sistema Visual y Modelo de Datos)  
**Fecha:** 2026-10-18  

---

## 1. Principios de Navegación para Campo

El supervisor no puede lidiar con menús laberínticos o saltos impredecibles entre pestañas. Se implementa una **arquitectura de navegación plana y contextual** compuesta por:

1. **Barra de Navegación Superior Fija (Top Bar):** Identidad, modo sol y selector de módulos horizontales desplazables.
2. **Barra de Navegación de Acceso Rápido Inferior (Bottom Tab Bar):** Las 4 acciones más frecuentes del día en campo:
   - `[Resumen]` $\rightarrow$ Estado general del día.
   - `[Jornadas]` $\rightarrow$ Registro de tiempos y labores.
   - `[Asistencia]` $\rightarrow$ Pase de lista y ausencias.
   - `[Consulta Cruzada]` $\rightarrow$ Auditoría consolidada por persona/fecha.
3. **Menú de Módulos Complementarios:** Acceso fluido al resto de subsistemas especializados sin recargar la página.

---

## 2. Mapa Completo de los 12 Módulos Funcionales

```
                                   [NEXOCAMPO 2026]
                                          │
       ┌────────────────┬─────────────────┼────────────────┬────────────────┐
       ▼                ▼                 ▼                ▼                ▼
   [01. Inicio]   [02. Jornadas]    [03. Labores]    [04. Oficios]   [05. Plástico y
   Resumen día,   Apertura, pausas, Asignación por   Tareas varias   Polisombra]
   estado sync,   cierre, tiempos   lote, metas,     sin estándar    Coberturas, naves,
   alertas clima  efectivos         subtareas        cronometrado    justificación saldo
       │                │                 │                │                │
       └────────────────┴─────────────────┼────────────────┴────────────────┘
                                          │
       ┌────────────────┬─────────────────┼────────────────┬────────────────┐
       ▼                ▼                 ▼                ▼                ▼
  [06. Asistencia] [07. Ausencias]  [08. Consulta    [09. Reportes]  [10. Incidentes]
  Matriz semanal,  Licencias EPS,   Cruzada]         Consolidados,   Bitácora SG-SST,
  pase de lista    permisos con     Visor por persona planillas de   gravedad, primeros
  rápido           trazabilidad     y fecha          impresión PDF   auxilios
       │                │                 │                │                │
       └────────────────┴─────────────────┼────────────────┴────────────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
                [11. Respaldos]                    [12. Configuración]
                Exportación/Importación            Parámetros horarios (475m/360m),
                JSON local + Hash SHA-256          catálogo de labores, modo solar
```

---

## 3. Delimitación Estricta: Resúmenes vs Consulta Cruzada

Para evitar duplicidad de consultas y sobrecarga visual en pantallas móviles:

### Vistas de Jornada y Labores (Resúmenes Ligeros):
- Muestran resúmenes de solo lectura desplazables, orientados a la cuadrilla completa durante el día en curso.
- No permiten análisis histórico retrospectivo por operario individual.

### Módulo de Consulta Cruzada (Motor de Auditoría Profunda):
- Es la **única vista autorizada** para la exploración multidimensional por persona y fecha.
- Reconcilia en una sola pantalla:
  1. Presencia registrada en `Asistencia` (o estado "—, sin registrar").
  2. Novedad formal en `Ausencias` (si aplica).
  3. Labores individuales y minutos en `Jornadas`.
  4. Evaluación en `Rendimiento` (distinguiendo dato observado, estimado o estándar nulo).
  5. Incidentes de seguridad vinculados al colaborador.

---

## 4. Transiciones y Contención de Desbordamiento

- **Animaciones Suaves ($\le 200\text{ms}$):** Transición mediante opacidad y desplazamiento horizontal ligero con curvas de desaceleración natural.
- **Scroll Vertical Natural:** Cada vista gestiona su desplazamiento vertical de forma independiente; prohibido cualquier desbordamiento horizontal en viewport de $375\text{px}$ a $430\text{px}$.
- **Estado Permanente de Guardado:** El supervisor puede cambiar de módulo en cualquier momento sin perder los datos que haya ingresado en un formulario abierto; los borradores permanecen en memoria reactiva local hasta su confirmación o descarte explícito.
