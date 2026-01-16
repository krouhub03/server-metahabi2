import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Si el status code es 200 (OK) pero hubo error, forzamos 500 (Error de Servidor)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Aseguramos que err.message exista (por si se lanza un error que no sea instancia de Error)
    const message = err.message || 'Error desconocido';

    console.error('🔥 Error:', message);
    
    // Solo mostramos el stack trace si no estamos en producción
    if (process.env.NODE_ENV !== 'production' && err.stack) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};