import { Request, Response, NextFunction } from 'express';
// Asegúrate de que responseFormatter también esté convertido o tenga tipos
import ResponseFormatter from './responseFormatter'; 

// ==========================================
// INTERFACES Y TIPOS
// ==========================================

export interface ValidationErrorDetail {
    field: string;
    message: string;
    value?: any;
}

// ==========================================
// CLASES DE ERROR PERSONALIZADAS
// ==========================================

// Error base para la aplicación
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly timestamp: string;
    public errors?: ValidationErrorDetail[];

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        
        // Mantiene la cadena de prototipos correcta en V8 (Node.js)
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error para recursos no encontrados
 */
export class NotFoundError extends AppError {
    constructor(resource: string, message?: string) {
        super(message || `${resource} no encontrado`, 404);
    }
}

/**
 * Error para acceso no autorizado
 */
export class UnauthorizedError extends AppError {
    constructor(resourceOrMessage: string, message?: string) {
        // Lógica para manejar si se pasa solo mensaje o recurso + mensaje
        const msg = message || (resourceOrMessage.includes(' ') ? resourceOrMessage : `No autorizado para acceder a ${resourceOrMessage}`);
        super(msg, 401);
    }
}

// Error para permisos insuficientes
export class ForbiddenError extends AppError {
    constructor(message = 'Permisos insuficientes') {
        super(message, 403);
    }
}

// Error para validaciones fallidas
export class ValidationError extends AppError {
    constructor(message: string, errors: ValidationErrorDetail[] = []) {
        super(message, 400); // A veces 422 es más apropiado para validación semántica
        this.errors = errors;
    }
}

// Error para solicitudes incorrectas
export class BadRequestError extends AppError {
    constructor(message = 'Solicitud incorrecta') {
        super(message, 400);
    }
}

// Error para conflictos (ej: recurso duplicado)
export class ConflictError extends AppError {
    constructor(message = 'Conflicto con el recurso') {
        super(message, 409);
    }
}

// Error para límite de solicitudes excedido
export class TooManyRequestsError extends AppError {
    constructor(message = 'Demasiadas solicitudes, intenta más tarde') {
        super(message, 429);
    }
}

// Error interno del servidor
export class InternalServerError extends AppError {
    constructor(message = 'Error interno del servidor') {
        super(message, 500, false);
    }
}

// Error de servicio no disponible
export class ServiceUnavailableError extends AppError {
    constructor(message = 'Servicio temporalmente no disponible') {
        super(message, 503, false);
    }
}

// ==========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ==========================================

/**
 * Middleware central de manejo de errores
 */
export const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;
    const message = isOperational ? err.message : 'Error interno del servidor';
    
    // Log del error (solo en desarrollo o para errores no operacionales)
    if (!isOperational || process.env.NODE_ENV === 'development') {
        console.error('❌ Error capturado:', {
            message: err.message,
            statusCode,
            stack: err.stack,
            timestamp: err.timestamp || new Date().toISOString(),
            path: req.path,
            method: req.method,
            isOperational
        });
    }
    
    // Respuesta usando ResponseFormatter según el tipo de error
    switch (statusCode) {
        case 400:
            // Si tiene errores de validación múltiples
            if (err.errors && err.errors.length > 0) {
                return ResponseFormatter.validationError(res, err.errors, message);
            }
            return ResponseFormatter.badRequest(res, message, err.errors || []);
        
        case 401:
            return ResponseFormatter.unauthorized(res, message);
        
        case 403:
            return ResponseFormatter.forbidden(res, message);
        
        case 404:
            return ResponseFormatter.notFound(res, message);
        
        case 409:
            return ResponseFormatter.conflict(res, message);
        
        case 422:
            return ResponseFormatter.validationError(res, err.errors || [], message);
        
        default:
            return ResponseFormatter.error(res, message, statusCode);
    }
};

// ==========================================
// MIDDLEWARE AUXILIARES
// ==========================================

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Ruta ${req.originalUrl}`));
};

/**
 * Función helper para envolver funciones async y capturar errores
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Helper para validar y lanzar errores de validación (Tipado genérico para Joi)
 */
export const validateOrThrow = <T>(schema: any, data: any): T => {
    // asumiendo que schema es un objeto Joi
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
        const errors: ValidationErrorDetail[] = error.details.map((detail: any) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
        }));
        throw new ValidationError('Errores de validación', errors);
    }
    
    return value as T;
};