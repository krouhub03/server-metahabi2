import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Determinamos si estamos en entorno de TEST o PRODUCCIÓN/DEV
const isTest = process.env.NODE_ENV === 'test';

const dbName = isTest ? process.env.DB_NAME_TEST : process.env.MYSQL_DATABASE;
const dbUser = process.env.MYSQL_USER;
const dbPassword = process.env.MYSQL_PASSWORD;
const dbHost = process.env.MYSQL_HOST;
const dbPort = Number(process.env.MYSQL_PORT) || 3306;

// Validación rápida para evitar errores crípticos de Sequelize si falta el .env
if (!dbName || !dbUser || !dbHost) {
  throw new Error('❌ Faltan variables de entorno para la base de datos (DB_NAME, USER o HOST)');
}

const config: Options = {
    host: dbHost,
    dialect: 'mysql',
    port: dbPort,
    // Desactivamos logs en test para tener una consola limpia
    // En TS, logging espera una función o un booleano. console.log cumple la firma.
    logging: isTest ? false : console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// Instanciamos Sequelize
export const sequelize = new Sequelize(
    dbName, 
    dbUser, 
    dbPassword, // Puede ser undefined si no hay pass, Sequelize lo acepta
    config
);

export const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log(`✅ MySQL Conectado (${process.env.NODE_ENV || 'development'})`);
        
        // Si es test, no sincronizamos aquí, lo hace el setup.js de los tests
        if (!isTest) {
            // force: false evita borrar las tablas cada vez que inicias
            // alter: true (opcional) actualiza las tablas si cambias el modelo
            await sequelize.sync({ force: false }); 
            console.log('📊 Modelos sincronizados');
        }
        
    } catch (error: any) {
        console.error('❌ Error de conexión:', error.message);
        if (!isTest) process.exit(1); 
    }
};