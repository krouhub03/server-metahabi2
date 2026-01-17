import express, { Application, Request, Response, Express } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

// Importaciones locales
// Nota: Estos archivos deben ser convertidos a TS para que la importación no falle,
// o debes tener un archivo de declaración (.d.ts) para ellos.
import routes from './routes'; 
import swaggerSpec from './config/swagger';
import corsMiddleware from './middleware/cors.middleware'; 
import loggerMiddleware from './middleware/logger.middleware';
import timezoneMiddleware from './middleware/timezone.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { ErrorHandler, notFoundHandler } from './utils/responseErrors';
import { initSentry, Sentry } from './config/sentry'; // Importamos la config que hicimos antes

// Inicialización
const app: Application = express();

// ==========================================
// 0. INICIALIZACIÓN DE SERVICIOS EXTERNOS
// ==========================================

// Inicializamos Sentry antes de los middlewares
initSentry(app as unknown as Express);

// ==========================================
// 1. MIDDLEWARES GLOBALES
// ==========================================

// Seguridad HTTP
app.use(helmet());

// CORS (debe ir temprano)
app.use(corsMiddleware);

// IMPORTANTE: Si usas Nginx/Reverse Proxy (EasyPanel, Heroku, etc)
// debes descomentar esto para que el Rate Limiter funcione con la IP real.
// app.set('trust proxy', 1);

// Parsing de JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para manejar cookies
app.use(cookieParser());

// Middleware para manejar zonas horarias
app.use(timezoneMiddleware);

// Logging (Morgan/Winston)
app.use(loggerMiddleware);

// Rate Limiting para rutas API
app.use('/api',apiLimiter);

// ==========================================
// 2. DOCUMENTACIÓN
// ==========================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// 3. RUTAS
// ==========================================

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to MetaHabit API v2.0 🚀',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api', routes);

// ==========================================
// 4. MANEJO DE ERRORES (ORDEN CRÍTICO)
// ==========================================

// A. Sentry Error Handler (Debe ir ANTES de tus manejadores de errores personalizados)
// Esto asegura que Sentry capture las excepciones antes de que tu ErrorHandler las formatee.
Sentry.setupExpressErrorHandler(app);

// B. Middleware para rutas no encontradas (404)
app.use(notFoundHandler);

// C. Middleware central de manejo de errores
app.use(ErrorHandler);

export default app;