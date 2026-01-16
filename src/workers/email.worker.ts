import { Worker, Job } from 'bullmq';
// Importamos redisConfig (las opciones) para evitar conflictos de tipos
import { redisConfig } from '../config/redis'; 
import * as emailJobs from '../jobs/email.jobs';

// Definimos los tipos de nombres de trabajos permitidos
type EmailJobName = 'forgot-password' | 'welcome-email' | 'weekly-report';

interface EmailJobData {
    to: string;
    name?: string;
    context?: {
        link?: string;
        name?: string;
    };
    stats?: any;
    habits?: any[];
}

const emailWorker = new Worker<EmailJobData>(
    'email-queue',
    async (job: Job<EmailJobData>) => {
        console.log(`📦 [Job ${job.id}] Recibido: ${job.name}`);
        
        // Mapeo de handlers
        const jobHandlers: Record<string, (data: any) => Promise<any>> = {
            'forgot-password': emailJobs.sendForgotPasswordEmail,
            'welcome-email': emailJobs.sendWelcomeEmail,
            'weekly-report': emailJobs.sendWeeklyReport,
        };

        const handler = jobHandlers[job.name];

        if (handler) {
            // Ejecutamos el handler pasando los datos o el job según corresponda
            return await handler(job.name === 'forgot-password' ? job : job.data);
        } else {
            console.warn(`⚠️ No se encontró un procesador para el job: ${job.name}`);
        }
    },
    {
        // IMPORTANTE: Usamos redisConfig aquí para que BullMQ no falle con los tipos
        connection: redisConfig, 
        concurrency: 5,
        removeOnComplete: { count: 100 },
        removeOnFail: { age: 24 * 3600 }
    }
);

// --- Manejo de Eventos ---
emailWorker.on('completed', (job: Job) => {
    console.log(`✅ [Job ${job.id}] Finalizado con éxito.`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`❌ [Job ${job.id || 'unknown'}] Falló: ${err.message}`);
});

emailWorker.on('error', (err: Error) => {
    console.error(`🔥 Error crítico en EmailWorker:`, err.message);
});

console.log('📧 Email Worker iniciado y escuchando...');

export default emailWorker;