import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokens'; // Ajusta si tu archivo se llama tokens.ts
import { UnauthorizedError } from '../utils/responseErrors';
import { JwtPayload } from 'jsonwebtoken';

// 1. Extendemos la interfaz Request para incluir 'user'
export interface AuthRequest extends Request {
    user?: string | JwtPayload;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    // req.headers.authorization puede ser string | string[] | undefined.
    // Verificamos que sea string y lo dividimos.
    const token = (authHeader && typeof authHeader === 'string') 
        ? authHeader.split(' ')[1] 
        : null;

    // 1. Validar presencia del token
    if (!token) {
        // Es mejor usar next(error) en middlewares en lugar de throw para asegurar 
        // que Express capture el error correctamente en todas las versiones.
        return next(new UnauthorizedError('Acceso denegado. No se proporcionó token.'));
    }

    try {
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            console.error('FATAL: JWT_SECRET no está definido en variables de entorno');
            return next(new Error('Error interno de configuración'));
        }

        // 2. Verificación del token JWT
        const decoded = verifyToken(token, secret);

        if (!decoded) {
            return next(new UnauthorizedError('Token inválido o expirado.'));
        }

        // 3. Inyectamos los datos del usuario en la petición
        // Hacemos el casting a AuthRequest para que TS no se queje de la propiedad 'user'
        (req as AuthRequest).user = decoded;
        
        next();
    } catch (error) {
        // Si TokenUtil lanza un error, lo mandamos al ErrorHandler
        next(new UnauthorizedError('Token inválido o expirado.'));
    }
};

export default authMiddleware;