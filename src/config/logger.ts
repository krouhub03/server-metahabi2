import winston from 'winston';

// Definimos el formato
// En TS, winston.format.combine devuelve un objeto de tipo Format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // Esto es vital para ver el stack trace en los errores
  winston.format.json()
);

// Crear la instancia del logger
const logger = winston.createLogger({
  // Si LOG_LEVEL no existe, usamos 'info' por defecto
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    // Ejemplo comentado por si quieres guardar en archivo en el futuro:
    // new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;