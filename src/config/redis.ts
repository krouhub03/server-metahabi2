import IORedis, { RedisOptions } from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

const host = process.env.REDIS_HOST || '212.85.23.27';
const port = Number(process.env.REDIS_PORT) || 6379;
const username = process.env.REDIS_USER || 'default';
const password = process.env.REDIS_PASSWORD || process.env.REDIS_PASS;

// 1. Configuración de Redis
export const redisConfig: RedisOptions = {
    host,
    port,
    username,
    password,
    maxRetriesPerRequest: null, // OBLIGATORIO para BullMQ
    connectTimeout: 10000,
    retryStrategy(times: number) {
        // Reintento incremental hasta un máximo de 2 segundos
        return Math.min(times * 50, 2000);
    }
};

// 2. Crear la instancia de conexión
export const connection = new IORedis(redisConfig);

// EVENTO DE ÉXITO: Se dispara cuando la conexión es correcta
connection.on('connect', () => {
    logger.info(`✅ Redis conectado exitosamente en ${host}:${port}`);
    console.log(`✅ Redis Conectado a ${host}:${port}`);
});

// EVENTO DE ERROR: Se dispara cuando falla la conexión
// Aquí es donde 'err' sí existe y tiene la propiedad 'message'
connection.on('error', (err: any) => {
    logger.error('❌ Error de conexión en Redis:', {
        message: err?.message || 'Error desconocido',
        host: redisConfig.host,
        stack: err?.stack
    });
});

export default connection;