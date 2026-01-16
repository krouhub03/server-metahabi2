import dotenv from 'dotenv';
// Cargar variables de entorno lo antes posible
dotenv.config();

import app from './src/server';
import { sequelize } from './src/config/db';

// Importamos los modelos para asegurar que Sequelize conozca las definiciones y relaciones
// antes de hacer el sync(). Aunque app importa rutas que usan modelos, esto es más seguro.
import './src/models'; 

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    try {
        // 1. Verificar conexión a Base de Datos
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente.');

        // 2. Sincronizar Modelos
        // En producción se recomienda usar migraciones (Umzug) en lugar de sync()
        // alter: true intenta adaptar la tabla si hay cambios (cuidado en prod)
        await sequelize.sync({ alter: false, force: false });
        console.log('✅ Modelos sincronizados con la base de datos.');

        // 3. Arrancar el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV || 'development'} en el puerto ${PORT}`);
            console.log(`🔗 API URL: http://localhost:${PORT}/api`);
            console.log(`📄 Docs: http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error('❌ Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();