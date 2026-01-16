import cors, { CorsOptions } from 'cors';

// Lista de dominios permitidos (Whitelist)
const whitelist: string[] = [
    'http://localhost:3000', // Frontend Local
    'http://localhost:5173', // Vite
    process.env.FRONTEND_URL, // Producción
].filter((origin): origin is string => !!origin); 
// El filtro anterior elimina 'undefined' o strings vacíos y asegura a TS que es un array de strings

const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // !origin permite peticiones sin origen (como Postman o Server-to-Server)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`🔒 Bloqueado por CORS: ${origin}`);
            callback(new Error('No permitido por la política CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-timezone'],
    credentials: true,
    optionsSuccessStatus: 200
};

export default cors(corsOptions);