import morgan, { StreamOptions } from 'morgan';
import logger from '../utils/logger'; // Asumo que logger.ts ya tiene un export default o nombrado

// Stream: Función que usa Morgan para enviar los mensajes a Winston
// Definimos el tipo StreamOptions para asegurar que 'write' cumpla con lo que Morgan espera
const stream: StreamOptions = {
    write: (message: string) => {
        // Usamos el nivel 'http' de Winston definido en tu logger
        logger.http(message.trim());
    },
};

// Formato del mensaje HTTP
// En desarrollo es conciso, en producción incluye IP y User-Agent
const format = process.env.NODE_ENV === 'production'
    ? ':remote-addr - :method :url :status :res[content-length] - :response-time ms ":user-agent"'
    : ':method :url :status :response-time ms'; // Formato 'dev' simplificado

// Exportamos el middleware configurado
const loggerMiddleware = morgan(format, { stream });

export default loggerMiddleware;