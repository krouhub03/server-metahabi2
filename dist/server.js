"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Importaciones locales
// Nota: Estos archivos deben ser convertidos a TS para que la importación no falle,
// o debes tener un archivo de declaración (.d.ts) para ellos.
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = __importDefault(require("./config/swagger"));
const cors_middleware_1 = __importDefault(require("./middleware/cors.middleware"));
const logger_middleware_1 = __importDefault(require("./middleware/logger.middleware"));
const timezone_middleware_1 = __importDefault(require("./middleware/timezone.middleware"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const responseErrors_1 = require("./utils/responseErrors");
const sentry_1 = require("./config/sentry"); // Importamos la config que hicimos antes
// Inicialización
const app = (0, express_1.default)();
// ==========================================
// 0. INICIALIZACIÓN DE SERVICIOS EXTERNOS
// ==========================================
// Inicializamos Sentry antes de los middlewares
(0, sentry_1.initSentry)(app);
// ==========================================
// 1. MIDDLEWARES GLOBALES
// ==========================================
// Seguridad HTTP
app.use((0, helmet_1.default)());
// CORS (debe ir temprano)
app.use(cors_middleware_1.default);
// IMPORTANTE: Si usas Nginx/Reverse Proxy (EasyPanel, Heroku, etc)
// debes descomentar esto para que el Rate Limiter funcione con la IP real.
// app.set('trust proxy', 1);
// Parsing de JSON y URL-encoded
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware para manejar cookies
app.use((0, cookie_parser_1.default)());
// Middleware para manejar zonas horarias
app.use(timezone_middleware_1.default);
// Logging (Morgan/Winston)
app.use(logger_middleware_1.default);
// Rate Limiting para rutas API
app.use('/api', rateLimit_middleware_1.apiLimiter);
// ==========================================
// 2. DOCUMENTACIÓN
// ==========================================
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// ==========================================
// 3. RUTAS
// ==========================================
// Health Check
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to MetaHabit API v2.0 🚀',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});
// Rutas de la API
app.use('/api', routes_1.default);
// ==========================================
// 4. MANEJO DE ERRORES (ORDEN CRÍTICO)
// ==========================================
// A. Sentry Error Handler (Debe ir ANTES de tus manejadores de errores personalizados)
// Esto asegura que Sentry capture las excepciones antes de que tu ErrorHandler las formatee.
sentry_1.Sentry.setupExpressErrorHandler(app);
// B. Middleware para rutas no encontradas (404)
app.use(responseErrors_1.notFoundHandler);
// C. Middleware central de manejo de errores
app.use(responseErrors_1.ErrorHandler);
exports.default = app;
