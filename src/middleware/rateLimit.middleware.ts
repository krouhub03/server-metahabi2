import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Función auxiliar para manejar la respuesta cuando se excede el límite
// Tipamos 'options' con la interfaz que provee la librería
const limitHandler = (req: Request, res: Response, next: NextFunction, options: Options) => {
    logger.warn(`🛑 Rate Limit excedido por IP: ${req.ip} en ${req.originalUrl}`);
    
    // options.statusCode y options.windowMs pueden venir undefined en la interfaz genérica,
    // así que usamos valores por defecto seguros (429 y 1 min)
    const statusCode = options.statusCode || 429;
    const windowMs = options.windowMs || 60000;

    res.status(statusCode).json({
        message: options.message,
        retryAfter: Math.ceil(windowMs / 1000) + ' segundos'
    });
};

// 1. LIMITADOR GLOBAL (Para toda la API)
// Permite 100 peticiones cada 15 minutos por IP
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 100, // NOTA: En versiones nuevas de express-rate-limit, 'max' se renombró a 'limit' (aunque 'max' sigue soportado como legacy)
    standardHeaders: true, // Retorna info en los headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.',
    handler: limitHandler,
});

// 2. LIMITADOR ESTRICTO (Para Auth: Login/Register)
// Permite solo 5 intentos cada hora.
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    limit: 5, 
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiados intentos de inicio de sesión fallidos. Cuenta bloqueada temporalmente por 1 hora.',
    handler: limitHandler,
    skipSuccessfulRequests: true, // Si el login es exitoso, no cuenta como intento fallido
});