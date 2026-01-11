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

export const executeDeposit = async ({
  tipo,
  cuentaDestino,
  cantidad,
  concepto,
  fecha,
  adminId,
}) => {
  try {
    if (!adminId) {
      throw new Error('Administrador no identificado');
    }

    const resolvedType = tipo === 'personal' ? 'personal' : 'casa';
    const destino = resolvedType === 'casa' ? 'dinero_casa' : cuentaDestino;

    if (resolvedType === 'personal' && !destino) {
      throw new Error('Selecciona un usuario');
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

    const fechaNum = Number(fecha);
    if (!fechaNum || Number.isNaN(fechaNum)) {
      throw new Error('Fecha invalida');
    }

    if (fechaNum > Date.now()) {
      throw new Error('No puedes registrar depositos futuros');
    }

    const saldoActual = await getAccountBalance(destino);
    const nuevoSaldo = saldoActual + montoNum;
    const timestamp = Date.now();
    const transactionId = `trans_${timestamp}`;

    const transaction = {
      id: transactionId,
      tipo: resolvedType === 'casa' ? 'deposito_casa' : 'deposito_personal',
      cuentaDestino: destino,
      cantidad: montoNum,
      concepto: concepto.trim(),
      categoria: 'N/A',
      fecha: fechaNum,
      ejecutadaPor: adminId,
      estado: 'completada',
      requiereAprobacion: false,
      saldosResultantes: {
        [destino]: nuevoSaldo,
      },
    };

    if (resolvedType === 'personal') {
      transaction.usuario = destino;
    }

    const updates = {};
    updates[getBalancePath(destino)] = nuevoSaldo;
    updates[getLastUpdatePath(destino)] = timestamp;
    updates[`familia_finanzas/transacciones/${transactionId}`] = transaction;

    if (resolvedType === 'personal') {
      const notifId = `notif_${timestamp}`;
      updates[`familia_finanzas/notificaciones/${notifId}`] = {
        id: notifId,
        tipo: 'deposito_personal',
        destinatario: destino,
        monto: montoNum,
        fecha: timestamp,
        leida: false,
        mensaje: `Recibiste $${montoNum.toFixed(2)} - ${concepto.trim()}`,
      };
    }

    await update(ref(db), updates);

    return {
      success: true,
      newBalance: nuevoSaldo,
      transactionId,
    };
  } catch (error) {
    console.error('Error en deposito:', error);
    return {
      success: false,
      error: error?.message || 'Error al depositar',
    };
  }
};
