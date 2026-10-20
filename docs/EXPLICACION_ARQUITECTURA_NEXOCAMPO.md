# EXPLICACIÓN TÉCNICA Y CONCEPTUAL (/explain)
**Cómo Funciona NexoCampo Original, Qué Significa el Diagnóstico y Cómo Alcanzar la Fidelidad Absoluta**  
**Fecha:** 20 de Octubre de 2026  
**Documento Oficial para el Supervisor y Equipo de Desarrollo**

---

## 1. ¿QUÉ ES NEXOCAMPO Y CUÁL ES SU PROPÓSITO CENTRAL?

NexoCampo no es una página web convencional ni un panel administrativo de oficina. Es una **Herramienta Operativa Móvil de Campo (PWA)** diseñada para que los supervisores agrícolas, bajo condiciones extremas (sol directo, lluvia, barro, conectividad intermitente o nula), puedan realizar tres labores críticas en cuestión de segundos y con una sola mano:

1. **Pasar asistencia diaria** de los colaboradores de su cuadrilla.
2. **Registrar las jornadas de trabajo y las labores ejecutadas** (arreglo de camas, instalación de plásticos, erradicación, etc.), midiendo con precisión matemática el rendimiento real frente a metas o tiempos estándar.
3. **Controlar novedades del personal y eventos imprevistos** (ausencias, interrupciones externas, oficios varios e incidentes de seguridad laboral).

Todo esto bajo el principio innegociable de **Offline-First**: si el dispositivo no tiene señal celular en el lote o túnel, la aplicación sigue funcionando exactamente igual, guardando todo en la memoria interna del teléfono mediante **IndexedDB** y sincronizando silenciosamente cuando se recupera la red.

---

## 2. EL NÚCLEO DE NEXOCAMPO ORIGINAL (CÓMO FUNCIONA POR DENTRO)

Para entender las diferencias detectadas en la auditoría, debemos comprender los cuatro pilares que componen el código de NexoCampo original (`index.html` v18.1.9):

```
                               ┌────────────────────────────────────────────────────────┐
                               │                 CASCAJÓN MÓVIL ANDROID                 │
                               │                (.app-shell: máx 448 px)                │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                      ┌────────────────────────────────────┴────────────────────────────────────┐
                      ▼                                                                         ▼
     ┌──────────────────────────────────┐                                      ┌──────────────────────────────────┐
     │       BARRA INFERIOR (6 Vistas)  │                                      │      MOTOR LOCAL INDEXEDDB       │
     │ 🏠 Inicio    ✏️ Registrar        │                                      │ (DB: 'nexocampo', Versión: 4)    │
     │ 📊 Reportes  📅 Ausencias        │                                      ├──────────────────────────────────┤
     │ ✅ Asistencia ⚙️ Admin           │                                      │ 1. colaboradores (36 personas)   │
     └──────────────────────────────────┘                                      │ 2. labores (23 técnicas)         │
                                                                               │ 3. areas (Jamaica, Piloto, etc.) │
                                                                               │ 4. ausencias (7 códigos I,P,etc) │
                                                                               │ 5. jornadas (tramos compuestos)  │
                                                                               │ 6. asistencia (clave: col+fecha) │
                                                                               └──────────────────────────────────┘
```

### A. La Estructura de una "Jornada" y sus "Tramos"
En NexoCampo original, una **Jornada** no es una simple tarea suelta. Una jornada representa el día laboral completo de un colaborador o una cuadrilla, y contiene una secuencia ordenada de **Tramos**:
* **Tramo tipo Labor (`T_LABOR`):** Una actividad agrícola cronometrada (ej. *Arreglo camas* o *Instalar plásticos*). Tiene hora de inicio, hora de fin, ubicación (Área $\to$ Bloque $\to$ Túnel), unidades completadas y un estado (`cumple`, `pendiente`, `no_cumple`, `rechazado_calidad`, etc.).
* **Tramo tipo Auxiliar (`T_AUX`):** Tareas de apoyo como limpieza de herramientas o aseo de chiperas. **NO genera rendimiento técnico**, pero justifica el tiempo del trabajador.
* **Tramo tipo Interrupción (`T_INT`):** Situaciones externas fuera del control de la cuadrilla (descarga de camión, apoyo a otra bodega, lluvia torrencial). **Se descuenta de los minutos de la jornada** para no castigar injustamente el rendimiento del operario.
* **Tramo tipo Incidente (`T_INC`):** Eventos de seguridad (cortada, picadura, golpe). Registra primeros auxilios sin exigir hora final.

### B. El Motor Matemático y las Fórmulas Reales
El cálculo de rendimiento en NexoCampo v18.1.9 obedece a reglas de ingeniería agronómica muy estrictas:

1. **Jornada Base:**
   * De Lunes a Viernes: 540 minutos brutos (06:30 a 15:30) menos 65 minutos de pausas (60 min de almuerzo + 5 min de pausa activa) = **475 minutos productivos netos**.
   * Sábados: 390 minutos brutos (06:30 a 13:00) menos 30 minutos de descanso = **360 minutos productivos netos**.
2. **Minutos Disponibles:**
   Si un trabajador tuvo una interrupción externa de 60 minutos (ej. ayudando a descargar un camión), sus minutos disponibles del día ya no son 475, sino $475 - 60 = 415$ minutos.
3. **Minutos Ganados:**
   Solo las labores cerradas con éxito (`cumple` o `validado`) generan minutos estándar ($Unidades \times MinutosEstándar$).
   * Si una labor fue rechazada por calidad (`rechazado_calidad`) o no se cumplió (`no_cumple`), **aporta estrictamente 0 minutos ganados** (0% de producción aceptada).
   * Si una labor quedó abierta (`pendiente` o `planificada`), **no entra a la fórmula** hasta que sea cerrada o justificada.
4. **La Regla de Oro de Oficios Varios:**
   Las tareas de oficios varios (mantenimiento de zanjas, desyerbe de perímetros) se miden únicamente por **tareas asignadas vs. tareas hechas** (ej. 5 de 5 = 100% de cumplimiento operativo). **NUNCA se mezclan con los minutos estándar de labores técnicas**, evitando que inflen o distorsionen el rendimiento agronómico.

---

## 3. ¿QUÉ DIFERENCIAS TIENE NUESTRO APLICATIVO ALTERNO Y POR QUÉ OCURRIERON?

Al construir el aplicativo alterno en React y TypeScript, se logró con éxito la parte más difícil del inventario:
* Se precargaron los **36 colaboradores reales con sus nombres completos y códigos**.
* Se cargaron las **23 labores con sus unidades, tiempos estándar y categorías**.
* Se estructuraron las **4 áreas territoriales exactas con sus túneles y bloques**.

Sin embargo, ocurrieron tres desviaciones conceptuales que la auditoría puso al descubierto:

### Desviación 1: Formato de Pantalla (Escritorio vs. Celular Android)
* *Lo que se hizo:* Una interfaz ancha tipo dashboard de computadora (`max-w-7xl`) con 15 pestañas horizontales superiores.
* *Lo que debe ser:* Un cascarón móvil de 28rem (448 px de ancho máximo) centrado en pantalla, con fondo claro de alto contraste para sol directo y una barra inferior fija con solo 6 botones para manejar con el pulgar.

### Desviación 2: Persistencia (Memoria React vs. Base de Datos Local)
* *Lo que se hizo:* La información se estaba guardando en variables temporales de React (`useState`). Cuando el usuario recarga la página, muchas de las listas vuelven a su estado inicial.
* *Lo que debe ser:* Cada clic en "Guardar" debe escribir directamente en la base de datos IndexedDB `nexocampo` (versión 4) en sus 6 almacenes. Al recargar la página, todo debe aparecer intacto sin perder un solo dato.

### Desviación 3: Fragmentación del Registro
* *Lo que se hizo:* Se crearon formularios separados: una pestaña para Jornadas, otra para Labores, otra para Plástico, otra para Incidentes y otra para Oficios Varios.
* *Lo que debe ser:* En NexoCampo, el supervisor va a la vista **✏️ Registrar** y allí mismo arma la jornada del día: agrega las labores que hizo el operario, agrega si tuvo una interrupción o un auxilio, y al darle guardar, se almacena una sola jornada compuesta con todos sus tramos vinculados.

---

## 4. ¿QUÉ SIGNIFICA EL ERROR DEL LINTER TS2339 DETECTADO EN /audit?

El comando `/audit` descubrió dos líneas en `src/components/labores/LaboresModulo.tsx`:
```
Property 'metaEstandar' does not exist on type 'LaborAgricola'.
```
Esto significa que en el código de TypeScript se intentó leer una propiedad llamada `metaEstandar` que no existe en el catálogo oficial de labores. El catálogo original define `min` (minutos estándar). La corrección técnica consiste en calcular la meta diaria en base al tiempo estándar de la jornada:
$$\text{Meta Diaria} = \frac{475\text{ minutos}}{\text{minutos estándar de la labor}}$$
Por ejemplo, si *Erradicar* tiene un estándar de 90 minutos, la meta esperada en un día completo de 475 minutos es $475 / 90 \approx 5.2$ túneles.

---

## 5. LA HOJA DE RUTA PARA LLEGAR AL 100% DE FIDELIDAD

Para transformar el aplicativo actual en una réplica exacta y funcional de NexoCampo original sin romper nada de lo que ya tenemos, ejecutaremos la siguiente secuencia:

1. **Paso 1 (Inmediato):** Corregir el tipado en `LaboresModulo.tsx` para dejar el compilador TypeScript en 0 errores.
2. **Paso 2 (Persistencia Canónica):** Conectar los 6 almacenes reales de IndexedDB (`colaboradores`, `labores`, `areas`, `ausencias`, `jornadas`, `asistencia`).
3. **Paso 3 (Alineación Visual Android):** Encapsular la vista en el cascarón móvil de 28rem con fondo claro nativo y barra inferior de 6 accesos: **Inicio**, **Registrar**, **Reportes**, **Ausencias**, **Asistencia**, **Admin**.
4. **Paso 4 (Registro Unificado por Tramos):** Permitir registrar jornadas completas con sus labores y deducciones en una sola pantalla.
5. **Paso 5 (Validación Cruzada):** Verificar que los reportes de rendimiento y asistencia lean en tiempo real los registros guardados en el dispositivo.

---
*Fin del documento explicativo (/explain).*
