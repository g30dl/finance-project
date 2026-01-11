import { get, ref, update } from 'firebase/database';
import { db } from './firebase';

const MAX_AMOUNT = 10000;
const MIN_CONCEPT_LENGTH = 5;

const getBalancePath = (accountId) => {
  if (accountId === 'dinero_casa') {
    return 'familia_finanzas/cuentas/dinero_casa/saldo';
  }
  return `familia_finanzas/cuentas/personales/${accountId}/saldo`;
};

const getLastUpdatePath = (accountId) => {
  if (accountId === 'dinero_casa') {
    return 'familia_finanzas/cuentas/dinero_casa/ultimaActualizacion';
  }
  return `familia_finanzas/cuentas/personales/${accountId}/ultimaActualizacion`;
};

const getAccountBalance = async (accountId) => {
  const balanceRef = ref(db, getBalancePath(accountId));
  const snapshot = await get(balanceRef);

  if (!snapshot.exists()) {
    throw new Error('Cuenta no encontrada');
  }

  return Number(snapshot.val()) || 0;
};

const determineTransferType = (origen, destino) => {
  if (origen === 'dinero_casa') return 'transferencia_casa_personal';
  if (destino === 'dinero_casa') return 'transferencia_personal_casa';
  return 'transferencia_personal_personal';
};

const determineUsuario = (origen, destino, tipo) => {
  if (tipo === 'transferencia_casa_personal') return destino;
  return origen;
};

const buildNotification = ({ transaction, timestamp }) => {
  if (!transaction || transaction.cuentaDestino === 'dinero_casa') {
    return null;
  }

  const notifId = `notif_${timestamp}`;
  const amount = Number(transaction.cantidad) || 0;

  return {
    path: `familia_finanzas/notificaciones/${notifId}`,
    payload: {
      id: notifId,
      tipo: 'transferencia_recibida',
      destinatario: transaction.cuentaDestino,
      monto: amount,
      fecha: timestamp,
      leida: false,
      mensaje: `Recibiste $${amount.toFixed(2)} - ${transaction.concepto}`,
    },
  };
};

export const executeTransfer = async ({
  cuentaOrigen,
  cuentaDestino,
  cantidad,
  concepto,
  adminId,
}) => {
  try {
    if (!adminId) {
      throw new Error('Administrador no identificado');
    }

    if (!cuentaOrigen || !cuentaDestino) {
      throw new Error('Selecciona cuentas validas');
    }

    if (cuentaOrigen === cuentaDestino) {
      throw new Error('No puedes transferir a la misma cuenta');
    }

    const montoNum = Number(cantidad);
    if (!montoNum || Number.isNaN(montoNum) || montoNum <= 0) {
      throw new Error('Ingresa un monto valido mayor a 0');
    }

    if (montoNum > MAX_AMOUNT) {
      throw new Error(`El monto maximo es $${MAX_AMOUNT}`);
    }

    if (!concepto || !concepto.trim() || concepto.trim().length < MIN_CONCEPT_LENGTH) {
      throw new Error(`El concepto debe tener al menos ${MIN_CONCEPT_LENGTH} caracteres`);
    }

    const saldoOrigen = await getAccountBalance(cuentaOrigen);
    const saldoDestino = await getAccountBalance(cuentaDestino);

    if (saldoOrigen < montoNum) {
      throw new Error(`Saldo insuficiente. Disponible: $${saldoOrigen.toFixed(2)}`);
    }

    const nuevoSaldoOrigen = saldoOrigen - montoNum;
    const nuevoSaldoDestino = saldoDestino + montoNum;
    const tipo = determineTransferType(cuentaOrigen, cuentaDestino);
    const timestamp = Date.now();
    const transactionId = `trans_${timestamp}`;

    const transaction = {
      id: transactionId,
      tipo,
      cuentaOrigen,
      cuentaDestino,
      usuario: determineUsuario(cuentaOrigen, cuentaDestino, tipo),
      cantidad: montoNum,
      concepto: concepto.trim(),
      categoria: 'N/A',
      fecha: timestamp,
      ejecutadaPor: adminId,
      estado: 'completada',
      requiereAprobacion: false,
      saldosResultantes: {
        [cuentaOrigen]: nuevoSaldoOrigen,
        [cuentaDestino]: nuevoSaldoDestino,
      },
    };

    const updates = {};
    updates[getBalancePath(cuentaOrigen)] = nuevoSaldoOrigen;
    updates[getBalancePath(cuentaDestino)] = nuevoSaldoDestino;
    updates[getLastUpdatePath(cuentaOrigen)] = timestamp;
    updates[getLastUpdatePath(cuentaDestino)] = timestamp;
    updates[`familia_finanzas/transacciones/${transactionId}`] = transaction;

    const notification = buildNotification({ transaction, timestamp });
    if (notification) {
      updates[notification.path] = notification.payload;
    }

    await update(ref(db), updates);

    return {
      success: true,
      newBalances: {
        origen: nuevoSaldoOrigen,
        destino: nuevoSaldoDestino,
      },
      transactionId,
    };
  } catch (error) {
    console.error('Error en transferencia:', error);
    return {
      success: false,
      error: error?.message || 'No se pudo completar la transferencia',
    };
  }
};
