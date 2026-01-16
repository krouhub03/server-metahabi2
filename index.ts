import dotenv from 'dotenv';
dotenv.config();

import app from './src/server';
import logger from './src/utils/logger';
import { sequelize } from './src/config/db';
import './src/models'; 

// IMPORTANTE: Importa los workers aquí para que arranquen con el servidor


const PORT = process.env.PORT || 5002;

const startServer = async (): Promise<void> => {
    try {
        // Verificar conexión a Base de Datos
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente.');
        logger.debug('✅ Conexión a MySQL establecida correctamente.')
        // Sincronizar Modelos
        await sequelize.sync({ alter: false, force: false });
        console.log('✅ Modelos sincronizados con la base de datos.');
        logger.debug('✅ Modelos sincronizados con la base de datos.');
        // Arrancar el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor y Workers corriendo en puerto ${PORT}`);
        });

    } catch (error) {
    logger.error('❌ Error fatal al iniciar el servidor:', { 
            message: error.message, 
            stack: error.stack 
        });
        process.exit(1);
    }
};

startServer();