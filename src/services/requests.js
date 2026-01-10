import { equalTo, get, orderByChild, query, ref, set } from 'firebase/database';
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

const getCreateRequestErrorMessage = (error) => {
  if (!error) {
    return 'No se pudo crear la solicitud. Por favor intenta de nuevo.';
  }

  const code = error.code || '';
  if (code === 'PERMISSION_DENIED') {
    return 'No tienes permisos para crear solicitudes. Revisa las reglas de Firebase.';
  }

  if (code === 'NETWORK_ERROR') {
    return 'No se pudo conectar. Verifica tu conexion e intenta nuevamente.';
  }

  return 'No se pudo crear la solicitud. Por favor intenta de nuevo.';
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
    throw new Error(getCreateRequestErrorMessage(error));
  }
};

export const getUserRequests = async (userId) => {
  if (!userId) return [];

  try {
    const requestsRef = ref(db, 'familia_finanzas/solicitudes');
    const userQuery = query(requestsRef, orderByChild('usuario'), equalTo(userId));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const requests = Object.values(snapshot.val());
    return requests.sort((a, b) => (b.fechaSolicitud || 0) - (a.fechaSolicitud || 0));
  } catch (error) {
    console.error('Error fetching user requests:', error);
    throw new Error('No se pudieron cargar las solicitudes');
  }
};

export const getUserRequestsByStatus = async (userId, status) => {
  const allRequests = await getUserRequests(userId);
  return allRequests.filter((request) => request.estado === status);
};
