# PLAN INTEGRAL DE PRUEBAS Y CRITERIOS DE ACEPTACIÓN — NEXOCAMPO 2026
**Documento Técnico:** `06-plan-pruebas.md`  
**Estado:** Estrategia de Aseguramiento de Calidad (QA) — Tarea 1 de 5  
**Proyecto:** NexoCampo 2026 (Versión Experimental e Independiente)  

---

## 1. Estrategia y Pirámide de Pruebas

Para un sistema agrícola de misión crítica en campo, la confiabilidad se garantiza mediante una estrategia en capas:

```
                  / \
                 /   \
                / E2E \       Pruebas Funcionales de Usuario (Supervisor Journeys)
               /       \      Verificación de flujos en navegador móvil
              /---------\
             /           \
            / Integración \   Persistencia IndexedDB, Transacciones y Migraciones
           /               \
          /-----------------\
         /                   \
        /   Unitarias Puras   \  Cálculo de Minutos Efectivos, Fórmulas de Rendimiento,
       /     (node:test)       \ Validaciones de Entidades y Sanitización
      /-------------------------\
```

---

## 2. Pruebas Unitarias de Lógica Pura (Node Native Test Runner)

Ejecutadas con `node:test` y `node:assert/strict` en milisegundos, sin navegadores ni dependencias externas:

### 2.1. Casos de Prueba Críticos de Jornada y Aritmética
1. **Verificación de Jornada Semana (Lunes a Viernes):**
   - Entrada: Inicio `06:30`, Fin `15:30`.
   - Pausas: Desayuno 30 min, Almuerzo 30 min, 1 Pausa Adicional de 5 min.
   - Aserción: Minutos brutos = 540; Pausas = 65; Minutos efectivos netos = **475 min exactos**.
2. **Verificación de Jornada Sábado:**
   - Entrada: Inicio `06:30`, Fin `13:00`.
   - Pausas: Desayuno 30 min, Cero pausas de 5 min.
   - Aserción: Minutos brutos = 390; Pausas = 30; Minutos efectivos netos = **360 min exactos**.
3. **Manejo de Pausas Incompletas:**
   - Pausa sin hora de cierre debe marcar la jornada como `ESTADO_PENDIENTE_CIERRE` y no emitir tiempos negativos.

### 2.2. Casos de Prueba de Fórmulas de Rendimiento
1. **Rendimiento Temporal con Estándar Válido:**
   - Labor con estándar: `2.0 min/unidad`. Producción: `120 unidades` en `240 minutos efectivos`.
   - Tiempo Estándar = 240 min.
   - Rendimiento = `(240 / 240) * 100 = 100%`.
2. **Rendimiento Temporal sin Estándar (Labor "Oficios Varios"):**
   - Labor: `Limpieza de zanjas` (estándar = `null`).
   - Aserción: Rendimiento Temporal = `null`; Estado = `ESTANDAR_NO_DISPONIBLE`. Prohibido inventar número.
3. **Cumplimiento de Metas Físicas:**
   - Meta cuadrilla: `500 unidades`. Completadas: `450 unidades`.
   - Cumplimiento = `(450 / 500) * 100 = 90.00%`.
4. **Independencia frente a Asistencia:**
   - Colaborador con retardo matutino que inicia su labor a las 07:00 no ve alterada la fórmula matemática de su labor efectiva individual (su tiempo computable arranca a las 07:00, no a las 06:30).

---

## 3. Criterios de Aceptación por Módulo

| Módulo | Criterio de Aceptación Funcional | Criterio de Calidad Técnica |
| :--- | :--- | :--- |
| **`core`** | Detecta disponibilidad de Service Worker e IndexedDB al inicio. | No lanza excepciones no controladas en modo incógnito. |
| **`data`** | Crea y actualiza los 9 ObjectStores sin pérdida de datos preexistentes. | Transacciones atómicas; rollback ante fallo en cualquier store. |
| **`jornadas`** | Permite registrar apertura, pausas institucionales y cierre de cuadrilla. | Validación estricta: `horaCierre > horaApertura`. |
| **`labores`** | Soporta asociación de colaboradores a bloques, lotes y subtareas. | Rechaza asignaciones con colaboradores inexistentes o inactivos. |
| **`rendimiento`** | Emite métricas duales (temporal y cantidad) con clasificación de dato. | Prohibición absoluta de números arbitrarios si estándar es nulo. |
| **`asistencia`** | Permite pase de lista en menos de 60 segundos para 30 colaboradores. | Guardado individual o por lote con persistencia local inmediata. |
| **`incidentes`** | Registra hora, lote, causa y primeros auxilios de forma ágil. | No solicita ni persiste datos clínicos de reserva médica. |
| **`respaldos`** | Exporta volcado completo JSON con hash SHA-256 verificado. | Archivo legible e integrable; verificación de hash antes de restaurar. |
| **`ui`** | Botones táctiles >= 48x48px; modo alto contraste solar; sin saltos CLS. | Cero violaciones críticas de accesibilidad WCAG 2.1 AA. |

---

## 4. Pruebas de Resiliencia Offline

1. **Simulación de Corte de Conexión:**
   - Procedimiento: Cargar la app, activar "Offline Mode" en DevTools, registrar 5 colaboradores, una jornada y 2 incidentes.
   - Aceptación: Toda la interacción se completa sin mensajes de error de red ni pantallas blancas.
2. **Simulación de Recarga Forzada sin Conexión:**
   - Procedimiento: Conexión apagada, refrescar la página (`F5`).
   - Aceptación: El Service Worker sirve el Shell de la PWA desde la caché; IndexedDB presenta el estado íntegro capturado previamente.
