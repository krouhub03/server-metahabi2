import { Request, Response, NextFunction } from 'express';
import Joi, { Schema, ValidationResult } from 'joi';
import { AuthRequest } from './auth.middleware'; // Importamos la interfaz del paso anterior

/**
 * ============================================
 * VALIDATION MIDDLEWARE - MetaHabit
 * ============================================
 */

/**
 * Tipos de validación disponibles
 * Usamos 'as const' para crear un tipo literal seguro
 */
export const VALIDATION_SOURCE = {
  BODY: 'body',
  PARAMS: 'params',
  QUERY: 'query',
  HEADERS: 'headers'
} as const;

// Creamos un tipo que solo permite: 'body' | 'params' | 'query' | 'headers'
export type ValidationSource = typeof VALIDATION_SOURCE[keyof typeof VALIDATION_SOURCE];

/**
 * Factory de middleware de validación genérico
 */
export const validate = (schema: Schema, source: ValidationSource = VALIDATION_SOURCE.BODY) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validar que el source sea válido (extra check en runtime)
    if (!Object.values(VALIDATION_SOURCE).includes(source)) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración: source de validación inválido',
        error: `Source debe ser uno de: ${Object.values(VALIDATION_SOURCE).join(', ')}`
      });
    }

    // Obtener los datos a validar
    // Usamos 'as keyof Request' para decirle a TS que 'source' es una clave válida de Request
    const dataToValidate = req[source as keyof Request];

    const options = {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
      allowUnknown: false,
      presence: 'optional' as const // Joi requiere valores específicos aquí
    };

    const { error, value }: ValidationResult = schema.validate(dataToValidate, options);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        message: `Error de validación en ${source}`,
        errors
      });
    }

    // Reemplazar los datos originales con los validados
    // Usamos casting a 'any' para escribir en el request, ya que TS protege la escritura en props nativas
    (req as any)[source] = value;
    
    next();
  };
};

/**
 * Middleware para validar múltiples sources simultáneamente
 */
export const validateMultiple = (schemas: Record<string, Schema>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const allErrors: any[] = [];

    for (const [source, schema] of Object.entries(schemas)) {
      // Validación de seguridad de tipos en runtime
      if (!Object.values(VALIDATION_SOURCE).includes(source as ValidationSource)) {
        return res.status(500).json({
          success: false,
          message: 'Error de configuración: source de validación inválido'
        });
      }

      const validSource = source as ValidationSource;
      const dataToValidate = req[validSource as keyof Request];
      
      const options = {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      };

      const { error, value } = schema.validate(dataToValidate, options);

      if (error) {
        const formattedErrors = error.details.map(detail => ({
          source: validSource,
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));
        allErrors.push(...formattedErrors);
      } else {
        (req as any)[validSource] = value;
      }
    }

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: allErrors
      });
    }

    next();
  };
};

// ============================================
// SCHEMAS COMUNES REUTILIZABLES
// ============================================

export const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID debe ser un número',
      'number.integer': 'El ID debe ser un número entero',
      'number.positive': 'El ID debe ser positivo',
      'any.required': 'El ID es obligatorio'
    })
});

export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'La página debe ser un número',
      'number.min': 'La página debe ser al menos 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.min': 'El límite debe ser al menos 1',
      'number.max': 'El límite no puede exceder 100'
    }),

  sort: Joi.string()
    .valid('asc', 'desc', 'ASC', 'DESC')
    .default('desc')
    .messages({
      'any.only': 'El ordenamiento debe ser "asc" o "desc"'
    }),

  sortBy: Joi.string()
    .default('created_at')
    .messages({
      'string.base': 'El campo de ordenamiento debe ser texto'
    })
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida',
      'date.format': 'La fecha de inicio debe estar en formato ISO (YYYY-MM-DD)'
    }),

  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .messages({
      'date.base': 'La fecha de fin debe ser una fecha válida',
      'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
    })
});

export const searchSchema = Joi.object({
  search: Joi.string()
    .min(1)
    .max(255)
    .trim()
    .allow('')
    .messages({
      'string.min': 'El término de búsqueda debe tener al menos 1 carácter',
      'string.max': 'El término de búsqueda no puede exceder 255 caracteres'
    })
});

export const filterSchema = Joi.object({
  status: Joi.number()
    .integer()
    .valid(0, 1)
    .messages({
      'number.base': 'El estado debe ser un número',
      'any.only': 'El estado debe ser 0 (pendiente) o 1 (completado)'
    }),

  priority: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E')
    .uppercase()
    .messages({
      'any.only': 'La prioridad debe ser A, B, C, D o E'
    }),

  idUser: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID de usuario debe ser un número',
      'number.positive': 'El ID de usuario debe ser positivo'
    }),

  idIdentity: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID de identidad debe ser un número',
      'number.positive': 'El ID de identidad debe ser positivo'
    }),

  idGoal: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID de meta debe ser un número',
      'number.positive': 'El ID de meta debe ser positivo'
    })
});

export const complexQuerySchema = paginationSchema
    .concat(dateRangeSchema)
    .concat(searchSchema)
    .concat(filterSchema);

// ============================================
// VALIDACIONES CUSTOMIZADAS
// ============================================

/**
 * Middleware para validar propiedad (AuthRequest)
 */
export const validateOwnership = (source: ValidationSource = VALIDATION_SOURCE.BODY) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user || typeof authReq.user === 'string' || !authReq.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const data = (req as any)[source];
    
    // Si hay un idUser en los datos, debe coincidir con el usuario autenticado
    if (data && data.idUser && Number(data.idUser) !== Number(authReq.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware para validar fechas futuras
 */
export const validateFutureDate = (fieldName: string = 'scheduledDate', source: ValidationSource = VALIDATION_SOURCE.BODY) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = (req as any)[source];
    const dateValue = data?.[fieldName];

    if (dateValue) {
      const date = new Date(dateValue);
      const now = new Date();
      
      date.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (date < now) {
        return res.status(400).json({
          success: false,
          message: `La fecha de ${fieldName} no puede ser en el pasado`
        });
      }
    }

    next();
  };
};

/**
 * Helper placeholder para conteo
 */
const getResourceCount = async (userId: number, resourceType: string): Promise<number> => {
  // TODO: Implementar lógica real o inyección de dependencias
  throw new Error('getResourceCount debe ser implementado en el servicio correspondiente');
};

/**
 * Middleware para validar límites de recursos
 */
export const validateResourceLimit = (resourceType: string, maxLimit: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user || typeof authReq.user === 'string') {
         return res.status(401).json({ message: 'Auth required' });
      }

      // Casting a number seguro
      const count = await getResourceCount(Number(authReq.user.id), resourceType);

      if (count >= maxLimit) {
        return res.status(400).json({
          success: false,
          message: `Has alcanzado el límite de ${maxLimit} ${resourceType}`,
          limit: maxLimit,
          current: count
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para sanitizar strings y prevenir XSS
 */
export const sanitizeStrings = (source: ValidationSource = VALIDATION_SOURCE.BODY) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = (req as any)[source];

    if (data && typeof data === 'object') {
      const sanitizeObject = (obj: any) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            obj[key] = obj[key]
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
              .trim();
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      };

      sanitizeObject(data);
      (req as any)[source] = data;
    }

    next();
  };
};

/**
 * Middleware para validar tipos de archivos (Requiere Multer)
 */
export const validateFileType = (allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.file viene de Multer. Si no usas @types/multer, TS se quejará, así que usamos cast
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware para validar tamaño de archivo
 */
export const validateFileSize = (maxSizeInMB: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      return res.status(400).json({
        success: false,
        message: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeInMB}MB`
      });
    }

    next();
  };
};

/**
 * Middleware para validar prioridad según recurso
 */
export const validatePriorityForResource = (resourceType: 'goal' | 'subgoal' | 'task' | 'habit') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const priority = req.body.priority;

    if (!priority) {
      return next();
    }

    const validPriorities: Record<string, string[]> = {
      goal: ['A', 'B', 'C'],
      subgoal: ['A', 'B', 'C'],
      task: ['A', 'B', 'C', 'D', 'E'],
      habit: ['A', 'B', 'C']
    };

    const allowed = validPriorities[resourceType];

    if (!allowed) {
      return res.status(500).json({
        success: false,
        message: 'Tipo de recurso no válido'
      });
    }

    if (!allowed.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `La prioridad para ${resourceType} debe ser una de: ${allowed.join(', ')}`
      });
    }

    next();
  };
};

// ============================================
// UTILIDADES DE VALIDACIÓN
// ============================================

export const validateData = (data: any, schema: Schema) => {
  const options = {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  };

  const { error, value } = schema.validate(data, options);

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return {
      isValid: false,
      errors,
      value: null
    };
  }

  return {
    isValid: true,
    errors: null,
    value
  };
};