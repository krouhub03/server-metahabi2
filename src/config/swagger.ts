import path from 'path';
import swaggerJsDoc, { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MetaHabit API',
            version: '2.0.0',
            description: 'API para gestión de hábitos y productividad gamificada.',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Servidor de Desarrollo',
            },
            // Puedes agregar el de producción aquí
            // { url: 'https://api.metahabit.com', description: 'Producción' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    // IMPORTANTE: Busca tanto archivos .ts (desarrollo) como .js (producción)
    apis: [path.join(__dirname, '../routes/*.{ts,js}')],
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;