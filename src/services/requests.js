import { equalTo, get, orderByChild, query, ref, set, update } from 'firebase/database';
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
    const createdAt = Number(requestData?.createdAt) || Date.now();
    const requestId = requestData?.requestId || `solicitud_${createdAt}`;
    const requestRef = ref(db, `familia_finanzas/solicitudes/${requestId}`);
    const existing = await get(requestRef);

    if (existing.exists()) {
      return requestId;
    }

    const request = buildRequestPayload(requestId, requestData, createdAt);

    await set(requestRef, request);
    await createAdminNotification(request, Date.now());

    return requestId;
  } catch (error) {
    console.error('Error creating request:', error);
    throw new Error(getCreateRequestErrorMessage(error));
  }
};


const createUserNotification = async ({ userId, type, requestId, amount, category, reason }) => {
  try {
    const timestamp = Date.now();
    const notifId = `notif_${timestamp}`;
    const safeAmount = Number(amount) || 0;

    const messages = {
      solicitud_aprobada: `Tu solicitud de $${safeAmount.toFixed(2)} fue aprobada`,
      solicitud_rechazada: `Tu solicitud de $${safeAmount.toFixed(2)} fue rechazada${
        reason ? `: ${reason}` : ''
      }`,
    };

    const notification = {
      id: notifId,
      tipo: type,
      destinatario: userId,
      solicitudId: requestId,
      monto: safeAmount,
      categoria: category,
      fecha: timestamp,
      leida: false,
      mensaje: messages[type] || messages.solicitud_aprobada,
    };

    const notifRef = ref(db, `familia_finanzas/notificaciones/${notifId}`);
    await set(notifRef, notification);
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
};

export const approveRequest = async (requestId, adminId) => {
  try {
    if (!adminId) {
      throw new Error('Administrador no identificado');
    }

    const requestRef = ref(db, `familia_finanzas/solicitudes/${requestId}`);
    const requestSnapshot = await get(requestRef);

    if (!requestSnapshot.exists()) {
      throw new Error('Solicitud no encontrada');
    }

    const request = requestSnapshot.val();
    if (request.estado !== 'pendiente') {
      throw new Error('Esta solicitud ya fue procesada');
    }

    const casaRef = ref(db, 'familia_finanzas/cuentas/dinero_casa');
    const casaSnapshot = await get(casaRef);
    const casaBalance = Number(casaSnapshot.val()?.saldo) || 0;
    const requestAmount = Number(request.cantidad) || 0;

    if (casaBalance < requestAmount) {
      throw new Error(
        `Saldo insuficiente. Disponible: $${casaBalance.toFixed(2)}, Solicitado: $${requestAmount.toFixed(2)}`
      );
    }

    const timestamp = Date.now();
    const newBalance = casaBalance - requestAmount;
    const transactionId = `trans_${timestamp}`;
    const transaction = {
      id: transactionId,
      tipo: 'solicitud_aprobada',
      usuario: request.usuario,
      cuentaOrigen: 'dinero_casa',
      cuentaDestino: null,
      cantidad: requestAmount,
      categoria: request.categoria,
      concepto: request.concepto,
      fecha: timestamp,
      ejecutadaPor: adminId,
      estado: 'completada',
      requiereAprobacion: true,
      solicitudId: requestId,
      saldosResultantes: {
        dinero_casa: newBalance,
      },
    };

    const updates = {};
    updates[`familia_finanzas/solicitudes/${requestId}/estado`] = 'aprobada';
    updates[`familia_finanzas/solicitudes/${requestId}/fechaRespuesta`] = timestamp;
    updates[`familia_finanzas/solicitudes/${requestId}/aprobadoPor`] = adminId;
    updates[`familia_finanzas/solicitudes/${requestId}/motivoRechazo`] = null;
    updates['familia_finanzas/cuentas/dinero_casa/saldo'] = newBalance;
    updates['familia_finanzas/cuentas/dinero_casa/ultimaActualizacion'] = timestamp;
    updates[`familia_finanzas/transacciones/${transactionId}`] = transaction;

    await update(ref(db), updates);

    await createUserNotification({
      userId: request.usuario,
      type: 'solicitud_aprobada',
      requestId,
      amount: requestAmount,
      category: request.categoria,
    });

    return { success: true, newBalance, transactionId };
  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
};

export const rejectRequest = async (requestId, adminId, reason) => {
  try {
    if (!adminId) {
      throw new Error('Administrador no identificado');
    }

    const requestRef = ref(db, `familia_finanzas/solicitudes/${requestId}`);
    const requestSnapshot = await get(requestRef);

    if (!requestSnapshot.exists()) {
      throw new Error('Solicitud no encontrada');
    }

    const request = requestSnapshot.val();
    if (request.estado !== 'pendiente') {
      throw new Error('Esta solicitud ya fue procesada');
    }

    if (!reason || reason.trim().length < 5) {
      throw new Error('Debes proporcionar un motivo de rechazo');
    }

    const timestamp = Date.now();
    const updates = {};
    updates[`familia_finanzas/solicitudes/${requestId}/estado`] = 'rechazada';
    updates[`familia_finanzas/solicitudes/${requestId}/fechaRespuesta`] = timestamp;
    updates[`familia_finanzas/solicitudes/${requestId}/aprobadoPor`] = adminId;
    updates[`familia_finanzas/solicitudes/${requestId}/motivoRechazo`] = reason.trim();

    await update(ref(db), updates);

    await createUserNotification({
      userId: request.usuario,
      type: 'solicitud_rechazada',
      requestId,
      amount: Number(request.cantidad) || 0,
      category: request.categoria,
      reason: reason.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw error;
  }
};

export const getPendingRequests = async () => {
  try {
    const requestsRef = ref(db, 'familia_finanzas/solicitudes');
    const snapshot = await get(requestsRef);

    if (!snapshot.exists()) {
      return [];
    }

    return Object.values(snapshot.val())
      .filter((request) => request.estado === 'pendiente')
      .sort((a, b) => (a.fechaSolicitud || 0) - (b.fechaSolicitud || 0));
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw new Error('No se pudieron cargar las solicitudes pendientes');
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
