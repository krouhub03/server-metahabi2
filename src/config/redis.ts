import IORedis, { RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.REDIS_HOST || '212.85.23.27';
const port = Number(process.env.REDIS_PORT) || 6379;

// 1. Exportamos las opciones (Config) - Esto es lo que BullMQ prefiere
export const redisConfig: RedisOptions = {
    host,
    port,
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASSWORD || process.env.REDIS_PASS,
    maxRetriesPerRequest: null, // OBLIGATORIO para BullMQ
    connectTimeout: 10000,
    retryStrategy(times: number) {
        return Math.min(times * 50, 2000);
    }
};

// 2. Exportamos la instancia (Connection) - Para tus logs o consultas directas
export const connection = new IORedis(redisConfig);

connection.on('connect', () => {
    console.log(`✅ Redis Conectado a ${host}:${port}`);
});

// Exportación por defecto para mantener compatibilidad
export default connection;