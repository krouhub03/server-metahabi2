import { Worker, Job } from 'bullmq';
import connection from '../config/redis';
import * as notificationJobs from '../jobs/notification.jobs';

// Definimos los tipos de notificación permitidos para mayor seguridad
type NotificationType = 'push' | 'habit-reminder' | 'streak-broken';

// Estructura de los datos que viajan en la cola
interface NotificationJobData {
    type: NotificationType;
    data: {
        userId: string;
        habitName: string;
        streakDays: number;
        title: string;
        body: string;
        [key: string]: any; // Flexibilidad para datos adicionales
    };
}

const notificationWorker = new Worker<NotificationJobData>(
    'notification-queue',
    async (job: Job<NotificationJobData>) => {
        const { type, data } = job.data;
        
        console.log(`📱 [${job.id}] Procesando notificación: ${type}`);

        try {
            let result: any;
            
            switch (type) {
                case 'push':
                    result = await notificationJobs.sendPushNotification(data);
                    break;
                
                case 'habit-reminder':
                    result = await notificationJobs.sendHabitReminder(data);
                    break;
                
                case 'streak-broken':
                    result = await notificationJobs.sendStreakBroken(data);
                    break;
                
                default:
                    // TypeScript detectará si falta algún caso del type NotificationType
                    throw new Error(`Tipo de notificación desconocido: ${type}`);
            }
            
            console.log(`✅ [${job.id}] Notificación enviada`);
            return result;
            
        } catch (error: any) {
            console.error(`❌ [${job.id}] Error:`, error.message);
            throw error;
        }
    },
    {
        connection: connection as any,
        concurrency: 10 // Mayor concurrencia para tareas ligeras de red
    }
);

// Manejadores de eventos con tipado de BullMQ
notificationWorker.on('completed', (job: Job) => {
    console.log(`✅ Notificación ${job.id} enviada`);
});

notificationWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`❌ Notificación ${job.id || 'desconocida'} falló:`, err.message);
});

console.log('📱 Notification Worker iniciado');

export default notificationWorker;