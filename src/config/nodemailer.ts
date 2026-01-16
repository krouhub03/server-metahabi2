import nodemailer, { Transporter, TransportOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Crear el transporter
// Convertimos el puerto a Number porque process.env siempre devuelve string
const port = Number(process.env.EMAIL_PORT) || 2525;

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: port,
    // secure: true para puerto 465, false para otros (comúnmente)
    secure: port === 465, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
} as TransportOptions);

// 2. Verificar la conexión al iniciar
transporter.verify((error) => {
    if (error) {
        console.error('❌ Error en configuración de email:', error.message);
    } else {
        console.log(`✅ Servidor de email listo en ${process.env.EMAIL_HOST}:${port}`);
    }
});

export default transporter;