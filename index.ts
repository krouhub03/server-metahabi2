import dotenv from 'dotenv';
dotenv.config();

import app from './src/server';
import { sequelize } from './src/config/db';
import './src/models'; 

// 1. IMPORTA LOS WORKERS AQUÍ
// Esto activará los procesos de Email, Notification y Report al iniciar el servidor
import './src/worker'; 

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente.');

        await sequelize.sync({ alter: false, force: false });
        console.log('✅ Modelos sincronizados con la base de datos.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor y Workers corriendo en puerto ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error fatal al iniciar:', error);
        process.exit(1);
    }
};

startServer();