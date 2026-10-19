# ARQUITECTURA MODULAR Y SISTEMA DE DEPENDENCIAS — NEXOCAMPO 2026
**Documento Técnico:** `02-arquitectura.md`  
**Estado:** Arquitectura de Módulos e Interfaces — Tarea 1 de 5  
**Proyecto:** NexoCampo 2026 (Versión Experimental e Independiente)  

---

## 1. Principios de Diseño y Reglas Arquitectónicas

Para garantizar robustez, mantenibilidad y evitar la entropía en aplicaciones Offline-First, se establecen diez reglas inviolables:

1. **Inmutabilidad y Encapsulamiento del Estado:** Un módulo no puede modificar directamente el estado interno ni los atributos privados de otro.
2. **Comunicación por Interfaces Explícitas:** Toda interacción entre subsistemas se ejecuta mediante contratos tipados o servicios mediadores con puertos y adaptadores (Arquitectura Hexagonal / Clean Architecture).
3. **Desacoplamiento Estricto de la UI:** Las reglas de negocio, los cálculos de tiempo y los algoritmos de rendimiento deben permanecer en módulos agnósticos del DOM y del framework visual.
4. **Fuente Única de Verdad para Fórmulas:** Cada cálculo (horas efectivas, rendimiento, pausas) reside en un único módulo especializado. Prohibido duplicar operaciones aritméticas en controladores o vistas.
5. **Cero Duplicación de Validaciones:** Las reglas de validación estructural pertenecen a la capa de datos/dominio; la UI solo invoca y traduce los resultados a mensajes para el usuario.
6. **Grafo Acíclico de Dependencias (DAG):** La arquitectura es estrictamente unidireccional y jerárquica. Prohibida cualquier dependencia circular (Módulo A -> Módulo B -> Módulo A).
7. **Aislamiento de Fallos (Error Boundaries & Circuit Breakers):** Un error en el cálculo de rendimiento o en la carga de reportes no puede bloquear el registro de asistencia ni la captura de jornadas.
8. **Documentación Explícita de Dependencias:** Todo módulo declara formalmente sus contratos entrantes y salientes.
9. **Segregación de Entornos:** Aislamiento total entre perfiles de desarrollo, demostración con mocks sintéticos y producción/experimental.
10. **Diseño para Testabilidad Pura:** Todo el núcleo de dominio debe ser ejecutable y verificable mediante pruebas unitarias nativas sin requerir navegador ni entorno gráfico.

---

## 2. Mapa y Catálogo de Módulos (17 Módulos)

```
                              ┌────────────────────────────────────────┐
                              │             [ui] Interfaz              │
                              │ Componentes, Formularios, Vistas PWA   │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │         [core] Coordinador Base        │
                              │ Event Bus, Estado de App, Ciclo de Vida│
                              └───────────────────┬────────────────────┘
                                                  │
                ┌─────────────────────────────────┴─────────────────────────────────┐
                ▼                                                                   ▼
┌──────────────────────────────┐                                    ┌──────────────────────────────┐
│     [domain] Reglas Core     │                                    │        [data] Acceso         │
│  Validaciones de Negocio     │                                    │ IndexedDB, Esquemas, Storage │
└───────────────┬──────────────┘                                    └──────────────┬───────────────┘
                │                                                                  │
  ┌─────────────┼─────────────┬─────────────┐                       ┌──────────────┴───────────────┐
  ▼             ▼             ▼             ▼                       ▼                              ▼
[asistencia] [jornadas]   [labores]     [incidentes]          [respaldos]                   [integraciones]
  │             │             │                               (Export JSON)                  (Google Drive)
  ▼             ▼             ▼
[ausencias] ◄───┤       [plastico-polisombra]
                │             │
                ▼             ▼
        [oficios-varios]      │
                │             │
                ▼             ▼
          [rendimiento] ◄─────┘
                │
                ▼
      [consulta-cruzada] ◄──────────────────────────────────────────┘
                │
                ▼
           [reportes]
```

### Detalle de Responsabilidades por Módulo

1. **`core` (Inicialización, Configuración y Coordinación):**
   - **Responsabilidad:** Arranque del ciclo de vida, detección de capacidades del navegador (Service Worker, StorageManager, Notification API), orquestación del bus de eventos interno y gestión de configuración de entorno.
   - **Dependencias Permitidas:** Ninguna dependencia de dominio de alto nivel.
   - **Operaciones Prohibidas:** No manipula tablas IndexedDB directamente ni renderiza componentes visuales.

2. **`ui` (Componentes, Navegación, Accesibilidad y Diseño):**
   - **Responsabilidad:** Vistas optimizadas para móvil de alta visibilidad solar (modo alto contraste, botones táctiles amplios mínimo 48x48px), navegación por pestañas de acceso rápido, accesibilidad ARIA e inputs ergonómicos.
   - **Dependencias Permitidas:** Consume `core`, `domain` y servicios de consulta de datos.
   - **Operaciones Prohibidas:** No contiene cálculos de rendimiento ni accesos SQL/IndexedDB nativos directos.

3. **`data` (Persistencia, Consultas, Validaciones Estructurales y Migraciones):**
   - **Responsabilidad:** Abstracción completa de IndexedDB (`NexoCampo_Exp_2026_DB`). Apertura segura, manejo del evento `onupgradeneeded`, control de versiones atómicas y migraciones idempotentes sin pérdida de datos.
   - **Dependencias Permitidas:** Tipos e interfaces de `domain`.
   - **Operaciones Prohibidas:** No conoce lógica de interfaz de usuario ni orquesta flujos de negocio complejos.

4. **`domain` (Entidades, Validaciones de Negocio y Tipos Base):**
   - **Responsabilidad:** Modelado canónico de entidades (Colaborador, Jornada, Asignación, Pausa, Novedad). Validaciones de integridad funcional (ej. una pausa no puede terminar antes de iniciar).
   - **Dependencias Permitidas:** Módulo puro (cero dependencias externas, cero dependencias de DOM).
   - **Operaciones Prohibidas:** No realiza llamadas asíncronas de I/O ni interactúa con storage.

5. **`jornadas` (Jornadas Generales, Segmentos y Pausas):**
   - **Responsabilidad:** Gestión de la jornada diaria (apertura matutina, cierre de jornada), cronometraje de intervalos efectivos y consolidación de pausas institucionales (desayuno, almuerzo, pausas breves).
   - **Dependencias Permitidas:** `domain`, `data`.
   - **Operaciones Prohibidas:** No calcula rendimiento por labor ni asigna cuadrillas a labores individuales.

6. **`labores` (Catálogo de Labores y Subtareas Agrícolas):**
   - **Responsabilidad:** Catálogo estructurado de labores maestras (Cosecha, Poda, Encope, Deshoje, Plateo, Riego) y parámetros unitarios por bloque o variedad.
   - **Dependencias Permitidas:** `domain`, `data`.
   - **Operaciones Prohibidas:** No gestiona horarios generales de jornada.

7. **`rendimiento` (Fórmulas, Métricas y Resultados Técnicos):**
   - **Responsabilidad:** Ejecución rigurosa de las fórmulas analíticas aprobadas. Distingue estrictamente entre rendimiento temporal (%) y cumplimiento de metas físicas (%). Admite estados indeterminados (`ESTANDAR_NO_DISPONIBLE`).
   - **Dependencias Permitidas:** `domain`, lecturas de `jornadas` y `labores`.
   - **Operaciones Prohibidas:** No inventa estándares no documentados ni penaliza por ausencias ajenas al segmento laboral.

8. **`oficios-varios` (Labores sin Estándar Temporal Confirmado):**
   - **Responsabilidad:** Registro y contabilización de horas en tareas no estandarizadas (desyerbe manual imprevisto, movimiento de insumos, arreglo de caminos).
   - **Dependencias Permitidas:** `domain`, `data`, `jornadas`.
   - **Operaciones Prohibidas:** No emite porcentajes de eficiencia técnica formal sobre labores no calibradas.

9. **`plastico-polisombra` (Subtareas Especializadas de Cubiertas):**
   - **Responsabilidad:** Flujo específico para cuadrillas de infraestructura agrícola: tendido de polietileno, templado, colocación de guayas, grapado y costura de mallas polisombra. Métricas por nave, túnel o metro lineal.
   - **Dependencias Permitidas:** `domain`, `labores`, `data`.
   - **Operaciones Prohibidas:** No altera la jornada general del personal no asignado a esta labor.

10. **`asistencia` (Registro Semanal y Diario de Cuadrilla):**
    - **Responsabilidad:** Matriz de control de presencia matutina por colaborador. Estados: Presente, Retardo, Ausente justificado, Ausente injustificado, Permiso médico.
    - **Dependencias Permitidas:** `domain`, `data`.
    - **Operaciones Prohibidas:** No computa rendimiento técnico ni muta asignaciones sin confirmación del supervisor.

11. **`ausencias` (Gestión Formal de Novedades y Justificaciones):**
    - **Responsabilidad:** Registro de permisos formales, licencias, incapacidades médicas con trazabilidad documental básica.
    - **Dependencias Permitidas:** `domain`, `data`, `asistencia`.
    - **Operaciones Prohibidas:** No suprime registros de jornadas históricas consolidadas.

12. **`consulta-cruzada` (Consolidación y Reconciliación Analítica):**
    - **Responsabilidad:** Motor de agregación en memoria: cruza presencia en `asistencia` con horas efectivas en `jornadas` y producción registrada en `labores` / `rendimiento` para auditoría y nómina técnica.
    - **Dependencias Permitidas:** Lectura sobre `asistencia`, `jornadas`, `labores`, `rendimiento`.
    - **Operaciones Prohibidas:** No escribe directamente en las tablas transaccionales de otros módulos.

13. **`reportes` (Informes de Campo, Resúmenes y Exportación a Impresión):**
    - **Responsabilidad:** Generación de resúmenes diarios/semanales, vistas imprimibles aptas para PDF o papel, indicadores consolidados de cuadrilla.
    - **Dependencias Permitidas:** `consulta-cruzada`, `ui`.
    - **Operaciones Prohibidas:** No ejecuta lógica de persistencia de datos primarios.

14. **`incidentes` (Bitácora de Incidentes, Accidentes y Actos Inseguros):**
    - **Responsabilidad:** Registro inmediato de incidentes laborales (SG-SST), golpes de calor, contactos biológicos o daños en infraestructura, con hora, lugar, lote y medidas inmediatas.
    - **Dependencias Permitidas:** `domain`, `data`.
    - **Operaciones Prohibidas:** No vincula diagnósticos médicos reservados sin custodia especial de privacidad.

15. **`respaldos` (Exportación Criptográfica Local e Historial JSON):**
    - **Responsabilidad:** Exportación completa de almacenes IndexedDB a volcado JSON estructurado con hash de integridad (SHA-256), importación segura y verificación pre-restauración.
    - **Dependencias Permitidas:** `data`.
    - **Operaciones Prohibidas:** No destruye la base actual durante la exportación; en restauración exige confirmación explícita y snapshot de seguridad previo.

16. **`integraciones` (Sincronización con Google Drive / Servicios Autorizados):**
    - **Responsabilidad:** Sincronización diferida bajo demanda del archivo de respaldo JSON hacia Google Drive mediante OAuth 2.0 (token en memoria/cliente temporal), respetando la política de cero secretos en código fuente.
    - **Dependencias Permitidas:** `respaldos`, `security`.
    - **Operaciones Prohibidas:** No expone credenciales maestras en el cliente ni bloquea la app si no hay internet.

17. **`security` (Validaciones de Integridad, Sanitización y Privacidad):**
    - **Responsabilidad:** Sanitización contra XSS en cadenas de entrada, control de políticas de retención, pseudonimización de registros y validación de permisos de sesión de supervisor.
    - **Dependencias Permitidas:** `core`.
    - **Operaciones Prohibidas:** No almacena claves maestras en texto claro en `localStorage`.

18. **`tests` (Suite de Pruebas Automatizadas):**
    - **Responsabilidad:** Pruebas unitarias de lógica pura con `node:test`, suites de integración para el adaptador IndexedDB y pruebas funcionales de flujos completos.
    - **Dependencias:** Todos los módulos bajo prueba.

---

## 3. Prevención de Ciclos y Duplicación de Lógica

Para erradicar dependencias circulares y redundancia:
- **Estructura en Capas Estrictas:**
  - Capa 0: Tipos, contratos e interfaces puras (`domain/contracts`).
  - Capa 1: Persistencia e I/O de bajo nivel (`data`).
  - Capa 2: Servicios de dominio y reglas de cálculo (`jornadas`, `labores`, `rendimiento`).
  - Capa 3: Orquestación y consultas transversales (`consulta-cruzada`, `respaldos`).
  - Capa 4: Presentación y entrega (`ui`, `reportes`).
- **Regla de Dependencia Unidireccional:** Un módulo en la Capa N solo puede depender de módulos en las Capas N-1 o inferiores. Nunca en sentido ascendente.
- **Inyección de Dependencias:** Cuando dos subsistemas necesiten colaborar (e.g. `rendimiento` requiere datos de `jornadas`), se inyecta la función de consulta o el repositorio mediante una interfaz abstracta provista en el arranque por `core`.
