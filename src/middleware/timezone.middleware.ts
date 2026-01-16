import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// 1. Extendemos la interfaz Request
// Esto permite usar req.timezone en tus controladores sin que TS marque error.
export interface TimezoneRequest extends Request {
    timezone?: string;
}

const timezoneMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Intentar obtener la zona horaria desde los headers
    const header = req.headers['x-timezone'];

    // req.headers devuelve string | string[] | undefined.
    // Validamos que sea un string único.
    const clientTimezone = (typeof header === 'string') ? header : undefined;

    // 2. Validar o asignar UTC por defecto
    const finalTimezone = clientTimezone || 'UTC';

    // Asignamos al request (haciendo cast a nuestra interfaz extendida)
    (req as TimezoneRequest).timezone = finalTimezone;

    // 3. (Opcional) Log de depuración
    const now = new Date();
    
    // Solo logueamos en nivel debug para no saturar producción
    logger.debug(`🕒 Request procesada para Timezone: ${finalTimezone} | Server Time: ${now.toISOString()}`);

    next();
};

export default timezoneMiddleware;