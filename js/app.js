/**
 * NexoCampo 2026 - PWA Offline-First
 * Archivo: js/app.js
 * 
 * Controlador de Aplicación Cliente, Registro de Service Worker, Sincronización y UI Táctil.
 * 
 * Decisiones Técnicas Clave:
 * 1. Detección Proactiva de Conectividad:
 *    - Monitorea 'online' y 'offline' de navigator y actualiza inmediatamente la cabecera.
 * 2. Background Sync Graceful Degradation:
 *    - Si el navegador soporta 'SyncManager' en ServiceWorker, registra la tarea 'sync-jornadas'.
 *    - Si el navegador no lo soporta (ej. navegadores restrictivos o entornos webkit antiguos),
 *      activa un fallback automático que vacía la cola local al detectar el evento 'online'.
 * 3. Notificaciones Nativas con Permiso Progresivo:
 *    - Solicita Notification.requestPermission() sin bloquear el flujo operativo del usuario.
 * 4. PWA In-App Install Prompt:
 *    - Captura 'beforeinstallprompt' para ofrecer instalación en pantalla de inicio con botón dedicado.
 */

import {
  initDB,
  guardarRegistroPendiente,
  obtenerRegistrosPendientes,
  limpiarRegistrosPendientes,
  guardarJornadaConfirmada,
  obtenerTodasJornadas,
  contarPendientes,
  exportarBaseDatosJSON
} from './db.js';

let deferredPrompt = null;
let swRegistration = null;

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[NexoApp] Inicializando controlador PWA Offline-First...');
  
  // 1. Inicializar base de datos IndexedDB
  try {
    await initDB();
    await actualizarContadorPendientes();
    await renderizarListaPendientes();
    await renderizarHistorialJornadas();
  } catch (err) {
    console.error('[NexoApp] Error al inicializar IndexedDB:', err);
  }

  // 2. Registrar Service Worker y canal de Background Sync
  await registrarServiceWorker();

  // 3. Configurar escuchadores de red y estado
  configurarConectividad();

  // 4. Configurar eventos de formularios y botones táctiles
  configurarFormularios();

  // 5. Configurar instalador PWA
  configurarInstalacionPWA();
});

/**
 * Registra el Service Worker y escucha mensajes de sincronización
 */
async function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[NexoApp] Service Workers no están soportados en este navegador.');
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    swRegistration = reg;
    console.log('[NexoApp] Service Worker registrado exitosamente con ámbito:', reg.scope);

    // Solicitar permiso de notificaciones para confirmación de sincronización
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log('[NexoApp] Permiso de notificaciones:', permission);
        });
      }, 3000);
    }

    // Escuchar mensajes broadcast enviados por el Service Worker (ej. SYNC_COMPLETED)
    navigator.serviceWorker.addEventListener('message', async (event) => {
      console.log('[NexoApp] Mensaje recibido del Service Worker:', event.data);
      if (event.data?.type === 'SYNC_COMPLETED') {
        mostrarToast(`Sincronización completada: ${event.data.total} registros enviados`);
        await actualizarContadorPendientes();
        await renderizarListaPendientes();
        await renderizarHistorialJornadas();
      }
    });

  } catch (error) {
    console.error('[NexoApp] Error al registrar Service Worker:', error);
  }
}

/**
 * Registra la etiqueta de sincronización en segundo plano con el Service Worker
 */
export async function solicitarSincronizacionSegundoPlano() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('sync-jornadas');
      console.log('[NexoApp] Tarea Background Sync "sync-jornadas" registrada correctamente.');
      return true;
    } catch (err) {
      console.warn('[NexoApp] Falló el registro de sync (posible restricción):', err);
    }
  }

  // Fallback si no hay soporte de SyncManager: si estamos online, sincronizar inmediatamente
  if (navigator.onLine) {
    console.log('[NexoApp] Fallback: ejecutando sincronización directa...');
    sincronizarManualmente();
  }
  return false;
}

/**
 * Monitoreo del estado de conectividad en campo
 */
function configurarConectividad() {
  const banner = document.getElementById('connectivity-banner');
  const bannerText = document.getElementById('banner-status-text');

  function actualizarEstado() {
    const online = navigator.onLine;
    console.log(`[NexoApp] Conectividad alterada: ${online ? 'EN LÍNEA' : 'OFFLINE'}`);

    if (banner && bannerText) {
      if (online) {
        banner.className = 'connectivity-banner banner-online';
        bannerText.textContent = 'En Línea — Servidor conectado para sincronización';
      } else {
        banner.className = 'connectivity-banner banner-offline';
        bannerText.textContent = 'Modo Offline en Campo — Guardando en IndexedDB local';
      }
    }

    // Si vuelve la conexión y hay registros pendientes, disparar sincronización
    if (online) {
      solicitarSincronizacionSegundoPlano();
    }
  }

  window.addEventListener('online', actualizarEstado);
  window.addEventListener('offline', actualizarEstado);
  actualizarEstado();
}

/**
 * Vinculación de formularios de captura agrícola
 */
function configurarFormularios() {
  const formJornada = document.getElementById('form-registro-jornada');
  if (formJornada) {
    formJornada.addEventListener('submit', async (e) => {
      e.preventDefault();
      await guardarJornadaDesdeFormulario();
    });
  }

  // Botón manual de sincronización
  const btnSync = document.getElementById('btn-sync-now');
  if (btnSync) {
    btnSync.addEventListener('click', async () => {
      await sincronizarManualmente();
    });
  }

  // Botón de exportación JSON
  const btnExport = document.getElementById('btn-export-db');
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      const json = await exportarBaseDatosJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexocampo_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      mostrarToast('Copia de seguridad local JSON descargada.');
    });
  }
}

/**
 * Guarda el formulario en IndexedDB (siempre local-first) y solicita sincronización
 */
async function guardarJornadaDesdeFormulario() {
  const colaboradorId = document.getElementById('campo-colaborador')?.value || 'col_1';
  const laborId = document.getElementById('campo-labor')?.value || 'lab_1';
  const fecha = document.getElementById('campo-fecha')?.value || new Date().toISOString().split('T')[0];
  const horaInicio = document.getElementById('campo-hora-inicio')?.value || '06:30';
  const horaFin = document.getElementById('campo-hora-fin')?.value || '15:30';
  const cantidad = parseFloat(document.getElementById('campo-cantidad')?.value || '0');
  const observaciones = document.getElementById('campo-observaciones')?.value || '';

  const registro = {
    id: `jornada_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    colaboradorId,
    laborId,
    fecha,
    horaInicio,
    horaFin,
    cantidadEjecutada: cantidad,
    observaciones,
    creadoEn: new Date().toISOString()
  };

  try {
    // 1. Guardar en la cola local de IndexedDB
    await guardarRegistroPendiente('jornada', registro);
    mostrarToast('✓ Guardado en IndexedDB local seguro');

    // 2. Limpiar formulario
    const form = document.getElementById('form-registro-jornada');
    if (form) form.reset();

    // 3. Actualizar vistas
    await actualizarContadorPendientes();
    await renderizarListaPendientes();

    // 4. Registrar evento de Background Sync
    await solicitarSincronizacionSegundoPlano();

  } catch (error) {
    console.error('[NexoApp] Error al guardar formulario:', error);
    mostrarToast('Error al persistir registro en el dispositivo', true);
  }
}

/**
 * Sincronización manual invocada desde botón o fallback
 */
export async function sincronizarManualmente() {
  const pendientes = await obtenerRegistrosPendientes();
  if (pendientes.length === 0) {
    mostrarToast('No hay registros pendientes por sincronizar.');
    return;
  }

  if (!navigator.onLine) {
    mostrarToast('No es posible sincronizar: Dispositivo sin conexión.', true);
    return;
  }

  mostrarToast(`Sincronizando ${pendientes.length} registros...`);

  try {
    const respuesta = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registros: pendientes })
    });

    if (respuesta.ok) {
      // Guardar en confirmados y limpiar pendientes
      for (const item of pendientes) {
        await guardarJornadaConfirmada({
          id: item.payload?.id || `jornada_${Date.now()}`,
          entidad: item.entidad,
          fecha: item.payload?.fecha || new Date().toISOString().split('T')[0],
          datos: item.payload,
          sincronizadoEn: new Date().toISOString(),
          estado: 'sincronizado'
        });
      }

      await limpiarRegistrosPendientes();
      await actualizarContadorPendientes();
      await renderizarListaPendientes();
      await renderizarHistorialJornadas();

      mostrarToast(`✓ Sincronización exitosa: ${pendientes.length} registros`);

      // Mostrar notificación si está permitida
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('NexoCampo — Sincronización Completada', {
          body: `Se han subido ${pendientes.length} registros agrícolas al servidor.`,
          icon: '/pwa-192x192.png'
        });
      }
    } else {
      throw new Error(`Servidor devolvió código HTTP ${respuesta.status}`);
    }
  } catch (err) {
    console.error('[NexoApp] Error en sincronización manual:', err);
    mostrarToast('Error de red. Los registros siguen protegidos en IndexedDB.', true);
  }
}

/**
 * Actualiza el contador numérico de registros pendientes
 */
async function actualizarContadorPendientes() {
  const total = await contarPendientes();
  const badges = document.querySelectorAll('.sync-count-badge');
  badges.forEach((b) => {
    b.textContent = total.toString();
    b.style.display = total > 0 ? 'inline-flex' : 'none';
  });
}

/**
 * Renderiza la lista de registros que esperan sincronización
 */
async function renderizarListaPendientes() {
  const contenedor = document.getElementById('lista-pendientes');
  if (!contenedor) return;

  const pendientes = await obtenerRegistrosPendientes();
  if (pendientes.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.875rem;">
        No hay registros en cola. Todo se encuentra al día.
      </div>
    `;
    return;
  }

  contenedor.innerHTML = pendientes.map((item) => `
    <div class="record-item">
      <div class="record-info">
        <h4>${item.entidad.toUpperCase()} — ${item.payload?.colaboradorId || 'Sin ID'}</h4>
        <div class="record-meta">
          Fecha: ${item.payload?.fecha || 'Hoy'} | Horario: ${item.payload?.horaInicio || '06:30'} - ${item.payload?.horaFin || '15:30'}
        </div>
      </div>
      <span class="badge badge-pendiente">Pendiente Sync</span>
    </div>
  `).join('');
}

/**
 * Renderiza el historial de jornadas confirmadas localmente
 */
async function renderizarHistorialJornadas() {
  const contenedor = document.getElementById('lista-jornadas-confirmadas');
  if (!contenedor) return;

  const jornadas = await obtenerTodasJornadas();
  if (jornadas.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.875rem;">
        Aún no hay jornadas sincronizadas en esta sesión.
      </div>
    `;
    return;
  }

  contenedor.innerHTML = jornadas.slice(-5).reverse().map((j) => `
    <div class="record-item">
      <div class="record-info">
        <h4>Jornada ${j.datos?.colaboradorId || 'Agrícola'}</h4>
        <div class="record-meta">
          Fecha: ${j.fecha} | Sincronizado: ${new Date(j.sincronizadoEn).toLocaleTimeString()}
        </div>
      </div>
      <span class="badge badge-cumple">Sincronizado</span>
    </div>
  `).join('');
}

/**
 * Muestra mensaje toast temporal al usuario
 */
function mostrarToast(mensaje, esError = false) {
  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  if (esError) {
    toast.style.backgroundColor = '#991b1b';
  }
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/**
 * Configuración de instalación PWA (In-App Install Prompt)
 */
function configurarInstalacionPWA() {
  const btnInstalar = document.getElementById('btn-instalar-pwa');

  // Detectar modo standalone (ya instalado)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone && btnInstalar) {
    btnInstalar.style.display = 'none';
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstalar) {
      btnInstalar.style.display = 'inline-flex';
    }
  });

  if (btnInstalar) {
    btnInstalar.addEventListener('click', async () => {
      if (!deferredPrompt) {
        // En iOS Safari guiamos al usuario
        const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
        if (isIOS) {
          alert('Para instalar en iPhone o iPad:\n1. Pulsa el botón "Compartir" de Safari.\n2. Selecciona "Añadir a la pantalla de inicio".');
        } else {
          mostrarToast('Usa el menú del navegador para "Instalar aplicación".');
        }
        return;
      }

      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        mostrarToast('¡NexoCampo instalada con éxito!');
        btnInstalar.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }

  window.addEventListener('appinstalled', () => {
    mostrarToast('Aplicación NexoCampo añadida a la pantalla de inicio.');
    if (btnInstalar) btnInstalar.style.display = 'none';
  });
}
