import { ref, set } from 'firebase/database';
import { db } from './firebase';

const buildRequestPayload = (requestId, requestData, timestamp) => ({
  id: requestId,
  usuario: requestData.userId,
  nombreUsuario: requestData.userName,
  cantidad: Number(requestData.amount),
  categoria: requestData.category,
  concepto: requestData.concept.trim(),
  estado: 'pendiente',
  fechaSolicitud: timestamp,
  fechaRespuesta: null,
  aprobadoPor: null,
  motivoRechazo: null,
});

const createAdminNotification = async (request, timestamp) => {
  try {
    const notifId = `notif_${timestamp}`;
    const notification = {
      id: notifId,
      tipo: 'nueva_solicitud',
      destinatario: 'todos_admins',
      solicitudId: request.id,
      usuario: request.usuario,
      nombreUsuario: request.nombreUsuario,
      monto: request.cantidad,
      categoria: request.categoria,
      fecha: timestamp,
      leida: false,
      mensaje: `${request.nombreUsuario} solicita $${request.cantidad.toFixed(
        2
      )} para ${request.categoria}`,
    };

    const notifRef = ref(db, `familia_finanzas/notificaciones/${notifId}`);
    await set(notifRef, notification);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const createRequest = async (requestData) => {
  try {
    const timestamp = Date.now();
    const requestId = `solicitud_${timestamp}`;
    const request = buildRequestPayload(requestId, requestData, timestamp);
    const requestRef = ref(db, `familia_finanzas/solicitudes/${requestId}`);

    await set(requestRef, request);
    await createAdminNotification(request, timestamp);

    return requestId;
  } catch (error) {
    console.error('Error creating request:', error);
    throw new Error(
      'No se pudo crear la solicitud. Por favor intenta de nuevo.'
    );
  }
};

export const getUserRequests = async (userId) => {
  if (!userId) return [];
  return [];
};
