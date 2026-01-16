// server/src/worker.ts
import emailWorker from './workers/email.worker';
import notificationWorker from './workers/notification.worker';
import reportWorker from './workers/report.worker';

// Creamos un array explícito
const workers = [emailWorker, notificationWorker, reportWorker];

console.log('👷 Proceso de Workers iniciado...');

const shutdown = async () => {
    console.log('\n🛑 Cerrando workers...');
    // Cerramos cada worker de forma individual
    for (const worker of workers) {
        await worker.close();
    }
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);