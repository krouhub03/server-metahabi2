import emailWorker from './email.worker';
import notificationWorker from './notification.worker';
import reportWorker from './report.worker';

// Exportamos el array tipado de los workers
// Esto permite que el proceso principal los inicialice fácilmente
const workers = [emailWorker, notificationWorker, reportWorker];

export default workers;