import winston from 'winston';
import path from 'path';

// Definimos los niveles (Tipado explícito para que coincida con winston)
const levels: winston.config.AbstractConfigSetLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Determina el nivel según el entorno
const level = (): string => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Colores para la consola
const colors: winston.config.AbstractConfigSetColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Vinculamos los colores a winston
winston.addColors(colors);

// Formato de los mensajes
const format = winston.format.combine(
    // Añade el timestamp
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    
    // Validamos el entorno para decidir si colorear o usar JSON
    (process.env.NODE_ENV === 'development') 
        ? winston.format.colorize({ all: true }) 
        : winston.format.json(),

    // Definimos el formato de impresión final
    winston.format.printf((info) => {
        // En TypeScript, info a veces no infiere 'timestamp', 
        // así que lo accedemos o desestructuramos de forma segura.
        const { timestamp, level, message, ...meta } = info;
        
        // Si hay meta-data extra (objetos), los mostramos también
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
        
        return `${timestamp} ${level}: ${message} ${metaString}`;
    })
);

// Definimos los transportes
const transports = [
    // 1. Consola
    new winston.transports.Console(),

    // 2. Archivo de Errores
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
    }),

    // 3. Archivo Combinado
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
    }),
];

// Creamos la instancia del logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

export default logger;