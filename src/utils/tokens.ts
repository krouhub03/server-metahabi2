import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
// Asumiendo que constants tiene una estructura tipada o inferida

import dotenv from 'dotenv';

// Cargar variables de entorno (asegúrate de llamar esto al inicio de tu app, p.ej. en index.ts)
dotenv.config();

// Definimos la estructura de lo que guardaremos dentro del token
interface UserPayload {
    id: string | number;
}

// Validación simple para asegurar que las variables de entorno existen
const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`La variable de entorno ${key} no está definida.`);
    }
    return value;
};

// Generar Access Token (Corta duración)
export const generateAccessToken = (userId: string | number): string => {
    const secret = getEnvVariable('JWT_SECRET');
    const expiresIn = process.env.JWT_ACCESS_EXPIRATION 

    return jwt.sign({ id: userId }, secret, { 
        expiresIn: expiresIn as SignOptions['expiresIn'] 
    });
};

// Generar Refresh Token (Larga duración)
export const generateRefreshToken = (userId: string | number): string => {
    const secret = getEnvVariable('JWT_REFRESH_SECRET');
    const expiresIn = process.env.JWT_REFRESH_EXPIRATION;

    return jwt.sign({ id: userId }, secret, { 
        expiresIn: expiresIn as SignOptions['expiresIn']
    });
};

// Verificar cualquier token
export const verifyToken = <T = JwtPayload>(token: string, secret: string): T => {
    try {
        return jwt.verify(token, secret) as T;
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};
