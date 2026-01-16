import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

export const initSentry = (app: Express): void => {
    const dsn = process.env.SENTRY_DSN;

    // Solo inicializamos si existe el DSN
    if (dsn) {
        Sentry.init({
            dsn: dsn,
            environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
            integrations: [
                // Habilita tracing HTTP para peticiones entrantes/salientes
                Sentry.httpIntegration(),
                
                // Conecta Sentry con Express (SIN argumentos en v8)
                Sentry.expressIntegration(),
                
                // Habilita el perfilado de rendimiento (usando nodeProfilingIntegration)
                nodeProfilingIntegration(),
            ],
            // Conversión segura de string a float
            tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE 
                ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) 
                : 1.0,
            profilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE 
                ? parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) 
                : 1.0,
        });

        console.log('✅ Sentry inicializado correctamente');
    } else {
        // Opcional: Avisar en desarrollo que Sentry está apagado
        if (process.env.NODE_ENV !== 'test') {
            console.warn('⚠️ Sentry no inicializado: No se encontró SENTRY_DSN');
        }
    }
};

// Re-exportamos Sentry para usarlo en otros archivos
export { Sentry };