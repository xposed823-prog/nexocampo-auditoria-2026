# MATRIZ DE VALIDACIÓN DE FORMULARIOS Y MANEJO DE ERRORES — NEXOCAMPO 2026
**Documento Técnico:** `12-validaciones-formularios.md`  
**Estado:** Especificación de Campos, Reglas de Validación y Manejo de Persistencia  
**Fase:** Tarea 2 de 5 (Diseño UX/UI, Sistema Visual y Modelo de Datos)  
**Fecha:** 2026-10-18  

---

## 1. Directrices Generales de Validación Táctil

1. **Validación Preventiva en Tiempo Real:** Las advertencias de consistencia (e.g., `horaFin <= horaInicio`) se presentan inmediatamente sin bloquear el ingreso del usuario.
2. **Mensajes de Error Humanizados:** Explicaciones directas y claras en español sin exponer códigos de excepción del sistema.
3. **Resiliencia ante Fallos de Persistencia (IndexedDB):** Si la transacción de base de datos falla (e.g. cuota excedida o almacenamiento bloqueado en modo incógnito), el formulario conserva todos los datos ingresados en memoria y presenta el botón *«Reintentar Guardado Local»*.
4. **Comportamiento al Cancelar:** Si el usuario modifica campos y pulsa *«Cancelar»*, el sistema solicita confirmación mediante un diálogo accesible de descarte para evitar pérdidas accidentales.

---

## 2. Catálogo Detallado de Formularios y Reglas

### Formulario 1: Registro y Edición de Jornada (`FormJornada`)
- **Campos Obligatorios:**
  - `fecha`: string (formato `YYYY-MM-DD`). Valor inicial: Fecha actual.
  - `tipoDia`: enum (`'semana_laboral' | 'sabado'`). Valor inicial: Derivado del día de la semana.
  - `horaApertura`: string (formato `HH:mm`). Valor inicial: `"06:30"`.
  - `horaCierreEsperada`: string (formato `HH:mm`). Valor inicial: `"15:30"` (semana) o `"13:00"` (sábado).
- **Campos Opcionales:**
  - `horaCierreReal`: string | null.
  - `observaciones`: string (máx. 250 caracteres).
- **Validaciones:**
  - `horaCierreEsperada` debe ser estrictamente posterior a `horaApertura`. Mensaje: *"La hora de cierre debe ser posterior a la apertura."*
  - Si `horaCierreReal` está presente, debe ser posterior a `horaApertura`.
- **Estado tras Guardar:** Cierra modal, actualiza resumen operativo y marca jornada como `en_progreso` o `cerrada`.

---

### Formulario 2: Asignación de Labores Agrícolas (`FormLabor`)
- **Campos Obligatorios:**
  - `laborId`: string (seleccionada del catálogo oficial).
  - `colaboradoresIds`: string[] (mínimo 1 operario). Valor inicial: Cuadrilla activa.
  - `lote`: string (no vacío, ej. `"Lote 3 Norte"`).
  - `horaInicio`: string (`HH:mm`). Valor inicial: Fin de labor anterior o `"06:30"`.
  - `horaFin`: string (`HH:mm`).
  - `cantidadCompletada`: number (número >= 0).
- **Campos Opcionales:**
  - `bloque`: string | null.
  - `tunel`: string | null.
  - `cantidadProgramada`: number | null.
  - `calidadMuestra`: enum (`'optima' | 'regular' | 'rechazada'`).
- **Validaciones:**
  - `horaFin > horaInicio`. Mensaje: *"El fin de la labor debe ser posterior al inicio."*
  - `cantidadCompletada >= 0`. Mensaje: *"La cantidad no puede ser negativa."*
- **Estado tras Guardar:** Registro agregado a la jornada. Si se pulsó *«Guardar y Continuar»*, limpia cantidades pero conserva lote y cuadrilla para la siguiente labor.

---

### Formulario 3: Plástico y Polisombra (`FormPlasticoPolisombra`)
- **Campos Obligatorios:**
  - `fecha`: string (`YYYY-MM-DD`).
  - `integrantesCuadrillaIds`: string[] (mínimo 1, máximo 6 integrantes).
  - `horaInicio`: string (`HH:mm`).
  - `horaFin`: string (`HH:mm`).
  - `area`: string.
  - `bloque`: string.
  - `tunel`: string.
  - `cantidadTotal`: number (> 0).
  - `cantidadCompletada`: number (>= 0).
  - `condicionesAmbientales`: array (mínimo 1 condición seleccionada).
- **Validaciones:**
  - Integrantes entre 1 y 6. Mensaje: *"La cuadrilla de cubiertas admite máximo 6 colaboradores."*
  - `cantidadCompletada <= cantidadTotal`. Si es menor, se activa automáticamente la solicitud de justificación.
- **Disparador Condicional:** Si `cantidadCompletada < cantidadTotal`, el formulario marca el estado como `pendiente` y exige completar el Formulario de Justificación de Pendientes.

---

### Formulario 4: Justificación de Cantidades Pendientes (`FormJustificacionPendiente`)
- **Campos Obligatorios:**
  - `motivosSeleccionados`: array con al menos una opción elegida entre:
    - `tiempo_insuficiente` ("Tiempo insuficiente en la jornada")
    - `vientos_fuertes` ("Vientos fuertes")
    - `lluvia_intensa` ("Lluvia intensa")
- **Campos Opcionales:**
  - `notaExplicativaSupervisor`: string (máx. 120 caracteres).
- **Validaciones:**
  - Mínimo un motivo marcado. Mensaje: *"Seleccione al menos un motivo justificado para el saldo pendiente."*
  - Prohibido mezclar causas de herramientas rotas o reasignaciones en este módulo.

---

### Formulario 5: Oficios Varios (`FormOficiosVarios`)
- **Campos Obligatorios:**
  - `descripcionTarea`: string (no vacío, mín. 5 caracteres).
  - `colaboradoresIds`: string[] (mínimo 1).
  - `horaInicio`: string (`HH:mm`).
  - `horaFin`: string (`HH:mm`).
- **Campos Opcionales:**
  - `unidadesAproximadas`: number | null.
  - `unidadTexto`: string (ej. `"metros desyerbados"`).
- **Validaciones:**
  - `horaFin > horaInicio`.
- **Aviso Informativo de Dominio:** Pantalla muestra permanentemente: *"Esta tarea no cuenta con estándar cronometrado. Se computarán horas trabajadas sin cálculo de rendimiento técnico ficticio."*

---

### Formulario 6: Reporte de Incidente o Accidente (`FormIncidente`)
- **Campos Obligatorios:**
  - `fecha`: string (`YYYY-MM-DD`).
  - `horaEvento`: string (`HH:mm`).
  - `severidad`: enum (`'leve' | 'moderado' | 'grave'`).
  - `tipoEvento`: enum (`'corte_herramienta' | 'golpe_calor' | 'caida' | 'contacto_quimico' | 'dano_estructura'`).
  - `area`: string.
  - `descripcion`: string (mín. 10 caracteres).
- **Campos Opcionales:**
  - `bloque`: string | null.
  - `tunel`: string | null.
  - `fotografiaUrl`: string | null (**opcional**; nunca bloquea el reporte).
  - `primerosAuxiliosAplicados`: boolean.
- **Validaciones Estrictas:**
  - **No se solicita hora final ni duración.** Mensaje si el usuario intenta ingresarla: *"Los incidentes son eventos puntuales; no registran hora de término."*
  - **No se capturan diagnósticos médicos confidenciales ni historias clínicas.**

---

## 3. Protocolo de Resiliencia ante Fallo de Persistencia

```
[Usuario presiona "Guardar"]
          │
          ▼
[Validación de Invariantes de Negocio en Dominio]
   ├── Error ──> Resalta campo + Muestra mensaje en rojo + Foco táctil
   └── Válido
          │
          ▼
[Transacción Atómica en IndexedDB (data/adapter)]
   ├── Exitoso ──> Cierra modal + Feedback Toast (2.5s) + Actualiza vista
   └── Error (Almacenamiento bloqueado / Cuota agotada / Fallo I/O)
          │
          ▼
[Pantalla de Salvaguarda de Emergencia]
   - NO se borran los datos del formulario
   - Banner visible: "⚠️ No se pudo guardar en la memoria local"
   - Botón 1: [Reintentar Guardado Local]
   - Botón 2: [Exportar Registro a Archivo JSON de Emergencia]
```
