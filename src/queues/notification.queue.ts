import { Queue } from 'bullmq';
import connection from '../config/redis';

// Definimos los tipos de notificación para mayor seguridad
export type NotificationJobType = 'push' | 'habit-reminder' | 'streak-broken';

// Interfaz para los datos que acepta esta cola
interface NotificationQueueData {
    type: NotificationJobType;
    data: {
        userId: string;
        habitName?: string;
        streakDays?: number;
        title?: string;
        body?: string;
        [key: string]: any; // Permitir metadatos adicionales
    };
}

const notificationQueue = new Queue<NotificationQueueData>('notification-queue', {
    connection: connection as any,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'fixed',
            delay: 3000
        },
        removeOnComplete: {
            age: 1800, // 30 minutos
            count: 50
        },
        removeOnFail: {
            age: 12 * 3600 // 12 horas
        }
    }
});

notificationQueue.on('error', (error: Error) => {
    console.error('❌ Error en notificationQueue:', error.message);
});

export default notificationQueue;