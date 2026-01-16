// ============================================================================
// server/src/queues/emailQueue.ts
// ============================================================================
import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis'; // 👈 Importamos las OPCIONES, no la conexión activa

const emailQueue = new Queue('email-queue', {
    connection: redisConfig, // 👈 Pasamos el objeto de configuración
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000 
        },
        removeOnComplete: {
            age: 3600, 
            count: 100
        },
        removeOnFail: {
            age: 24 * 3600 
        }
    }
});

emailQueue.on('error', (error: Error) => {
    console.error('❌ Error en emailQueue:', error.message);
});

export default emailQueue;