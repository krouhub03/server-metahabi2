import { Worker, Job } from 'bullmq';
import connection from '../config/redis';
import * as reportJobs from '../jobs/report.jobs';
import { emailQueue } from '../queues/index';

// Definimos la estructura de los datos que el Job espera recibir
interface ReportJobData {
    type: 'weekly' | 'monthly';
    data: {
        email: string;
        name: string;
        userId: string;
        [key: string]: any;
    };
}

const reportWorker = new Worker<ReportJobData>(
    'report-queue',
    async (job: Job<ReportJobData>) => {
        const { type, data } = job.data;
        
        console.log(`📊 [${job.id}] Generando reporte: ${type}`);
        const startTime = Date.now();

        try {
            let report: any;
            
            switch (type) {
                case 'weekly':
                    // Genera la lógica del reporte
                    report = await reportJobs.generateWeeklyReport(data);
                    
                    // Encadenamiento de procesos:
                    // Una vez generado el reporte, disparamos el trabajo de email
                    await emailQueue.add('weekly-report', {
                        type: 'weekly-report',
                        to: data.email,
                        name: data.name,
                        stats: report.stats,
                        habits: report.habits
                    });
                    break;
                
                case 'monthly':
                    report = await reportJobs.generateMonthlyReport(data);
                    break;
                
                default:
                    throw new Error(`Tipo de reporte desconocido: ${type}`);
            }
            
            const duration = Date.now() - startTime;
            console.log(`✅ [${job.id}] Reporte generado en ${duration}ms`);
            
            return report;
            
        } catch (error: any) {
            console.error(`❌ [${job.id}] Error:`, error.message);
            throw error;
        }
    },
    {
        connection: connection as any,
        concurrency: 2 // Procesamiento pesado, se mantiene bajo para no saturar el CPU
    }
);

// Manejo de eventos
reportWorker.on('completed', (job: Job) => {
    console.log(`✅ Reporte ${job.id} completado`);
});

reportWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`❌ Reporte ${job.id || 'desconocido'} falló:`, err.message);
});

console.log('📊 Report Worker iniciado');

export default reportWorker;