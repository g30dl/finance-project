import { z } from 'zod';
import { REQUEST_LIMITS } from './constants';

export const requestSchema = z.object({
  userId: z.string().min(1, { message: 'Usuario requerido' }),
  userName: z.string().min(1, { message: 'Nombre requerido' }),
  amount: z
    .number({
      required_error: 'Monto requerido',
      invalid_type_error: 'Monto invalido',
    })
    .positive({ message: 'Ingresa un monto valido mayor a 0' })
    .max(REQUEST_LIMITS.MAX_AMOUNT, {
      message: `El monto no puede exceder $${REQUEST_LIMITS.MAX_AMOUNT}`,
    }),
  category: z
    .string()
    .trim()
    .min(1, { message: 'Selecciona una categoria' }),
  concept: z
    .string()
    .trim()
    .min(REQUEST_LIMITS.MIN_CONCEPT_LENGTH, {
      message: `El concepto debe tener al menos ${REQUEST_LIMITS.MIN_CONCEPT_LENGTH} caracteres`,
    })
    .max(REQUEST_LIMITS.MAX_CONCEPT_LENGTH, {
      message: `El concepto no puede exceder ${REQUEST_LIMITS.MAX_CONCEPT_LENGTH} caracteres`,
    }),
});
