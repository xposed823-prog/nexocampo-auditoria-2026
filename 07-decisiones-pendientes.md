# MATRIZ DE DECISIONES PENDIENTES Y PREGUNTAS CLAVE — NEXOCAMPO 2026
**Documento Técnico:** `07-decisiones-pendientes.md`  
**Estado:** Banco de Preguntas y Desacoplamiento de Decisiones — Tarea 1 de 5  
**Proyecto:** NexoCampo 2026 (Versión Experimental e Independiente)  

---

## 1. Decisiones que Pueden Tomarse YA (Sin Alterar Reglas de Negocio)

Estas decisiones arquitectónicas y técnicas no comprometen ninguna regla agronómica ni laboral y pueden implementarse de inmediato:

1. **Arquitectura Modular Hexagonal (17 Módulos):**  
   Desacoplamiento total entre interfaz, orquestación y dominio analítico.
2. **Esquema de Persistencia Aislado:**  
   Creación de la base de datos `NexoCampo_Exp_2026_DB` con claves UUIDv4 y versionado idempotente.
3. **Cero Datos Reales en Prototipo:**  
   Uso de identificadores funcionales anonimizados (`COL-001`, `COL-002`) y alias genéricos.
4. **Parametrización Dinámica de Horarios:**  
   En lugar de codificar constantes rígidas de 475 o 360 minutos, la lógica calculará los minutos a partir de los horarios de apertura, cierre y registro de pausas, permitiendo ajustar los parámetros sin romper el software.
5. **Doble Métrica de Rendimiento:**  
   Separación absoluta entre *Rendimiento Temporal (%)* y *Cumplimiento de Cantidad (%)*.
6. **Manejo de Labores sin Estándar:**  
   Retorno de estado `ESTANDAR_NO_DISPONIBLE` y valor `null` para cualquier labor que no cuente con tiempo estándar certificado.
7. **Diseño de Interfaz de Alta Luminosidad:**  
   Vistas táctiles de alto contraste adaptadas a la luz solar directa y botones con superficie mínima de 48x48px.

---

## 2. Decisiones y Preguntas que Deben Esperar Validación

Las siguientes definiciones requieren resolución formal por parte de los líderes del proyecto, agrónomos o coordinadores de campo antes de su implementación en las fases subsecuentes:

### Pregunta 1: Catálogo Oficial y Tiempos Estándar de Labores
- **Contexto:** Para calcular el rendimiento temporal se requiere el valor $\text{Minutos Estándar por Unidad}$.
- **Pregunta:** ¿Existe una tabla técnica oficial de labores con sus estándares aprobados por labor, lote y variedad vegetal? ¿Cuáles labores pertenecen formalmente a la categoría de "Oficios Varios"?
- **Riesgo si no se valida:** Podrían proyectarse rendimientos artificiales no homologados.

### Pregunta 2: Distribución de Pausas de 5 Minutos y Aritmética de los 475 Minutos
- **Contexto:** Lunes a viernes tiene 540 min brutos. Desayuno (30 min) y almuerzo (30 min) dejan 480 min. Para alcanzar la cifra estimada de 475 min, resta una deducción exacta de 5 minutos.
- **Pregunta:** ¿Se toma exactamente UNA pausa de hidratación de 5 minutos al día, o son múltiples pausas de 5 minutos (lo que reduciría los minutos a 470 o 465)? ¿O esos 5 minutos corresponden a tiempo de traslado y alistamiento matutino?
- **Riesgo si no se valida:** Discrepancias entre la jornada reportada y el cálculo de rendimiento real.

### Pregunta 3: Esquema de Sábado y Pausas Breves
- **Contexto:** La ventana de sábado (6:30 a 13:00) arroja 390 min brutos. Descontando 30 min de desayuno da exactamente 360 minutos efectivos.
- **Pregunta:** ¿El sábado contempla también alguna pausa de 5 minutos (lo que daría 355 min netos), o la cuadrilla labora de corrido tras el desayuno?

### Pregunta 4: Tratamiento de Interrupciones Climáticas y Falta de Insumos
- **Contexto:** En campo ocurren lluvias torrenciales, tormentas eléctricas o retrasos en la llegada de fertilizantes.
- **Pregunta:** ¿Estas interrupciones se computan como tiempo muerto pagado que descuenta el tiempo efectivo de la labor, o se asignan a un código de labor auxiliar?

### Pregunta 5: Estructura Histórica de Datos del NexoCampo Original
- **Contexto:** Al no haber tenido acceso verificable al repositorio GitHub original ni a su base de datos local, no se conocen los nombres de los almacenes IndexedDB previos.
- **Pregunta:** Cuando el equipo autorice la homologación, ¿se requerirá importar un volcado JSON del sistema previo o migrar datos directos de un `IndexedDB` preexistente?

### Pregunta 6: Especificación de Métricas en Plástico y Polisombra
- **Contexto:** Las cuadrillas de infraestructura de cubierta tienen tareas complejas (tendido, grapado, tensado, costura).
- **Pregunta:** ¿Cuál es la unidad primaria de cómputo para este módulo? ¿Metros lineales de rollo tendido, naves completadas, túneles cerrados o metros de costura?

### Pregunta 7: Flujo de Respaldo en la Nube (Google Drive)
- **Contexto:** NexoCampo debe funcionar sin secretos en el cliente.
- **Pregunta:** ¿La integración con Google Drive debe realizarse vía autorización OAuth interactiva directa en el navegador (PKCE), o el protocolo preferido por el supervisor será la descarga de archivo JSON local cifrado/hasheado para carga manual asistida?

---

## 3. Plan de Continuidad para la Tarea 2

Una vez revisada y aprobada la presente arquitectura:
1. **Paso 1:** Implementación del módulo `domain/jornadas` con motor de cálculo puro y pruebas unitarias con `node:test`.
2. **Paso 2:** Implementación de la capa de persistencia `data` con adaptador seguro para IndexedDB.
3. **Paso 3:** Construcción de la interfaz base PWA con soporte de Service Worker y vistas de navegación rápida para el supervisor.
