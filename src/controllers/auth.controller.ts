import { Request, Response } from 'express';
import ResponseFormatter from '../utils/responseFormatter';
import { 
    ValidationError, 
    UnauthorizedError, 
    BadRequestError, 
    asyncHandler 
} from '../utils/responseErrors'; 
import UserService from '../services';

/**
 * Extensión de la interfaz Request para incluir los datos del usuario 
 * inyectados por el middleware de autenticación.
 */
interface AuthRequest extends Request {
    user?: {
        id: string;
        [key: string]: any;
    };
}

/**
 * Helper para configurar la cookie de refresco.
 */
const setRefreshCookie = (res: Response, token: string): void => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
};

// ==========================================
// 1. AUTENTICACIÓN BÁSICA
// ==========================================

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.AuthService.register(req.body);

    if (!result || !result.user) {
        throw new BadRequestError('No se pudo registrar el usuario');
    }

    setRefreshCookie(res, result.refreshToken);

    const userData = {
        user: {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email
        },
        accessToken: result.accessToken
    };
    
    return ResponseFormatter.created(res, userData, 'Usuario registrado exitosamente');
});

// ==========================================
// 1.1 INICIO DE SESIÓN
// ==========================================

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    
    if (!password || (!email && !username)) {
        throw new ValidationError('Email o username y contraseña son requeridos');
    }

    const result = await UserService.AuthService.login({ email, username, password });
    
    if (!result || !result.user) {
        throw new UnauthorizedError('Credenciales inválidas');
    }

    setRefreshCookie(res, result.refreshToken);

    const data = {
        accessToken: result.accessToken,
        user: {
            id: result.user.id,
            name: result.user.name,
            username: result.user.username
        }
    };

    return ResponseFormatter.success(res, data, 'Inicio de sesión exitoso');
});

// ==========================================
// 1.2 REFRESCO DE TOKENS
// ==========================================

export const refreshUserToken = asyncHandler(async (req: Request, res: Response) => {
    const tokenFromCookie = req.cookies.refreshToken;
    
    if (!tokenFromCookie) {
        throw new UnauthorizedError('No hay token de sesión');
    }

    const { accessToken, refreshToken } = await UserService.AuthService.refreshToken(tokenFromCookie);

    setRefreshCookie(res, refreshToken);

    return ResponseFormatter.success(res, { accessToken }, 'Token actualizado exitosamente');
});

// ==========================================
// 1.3 CIERRE DE SESIÓN
// ==========================================

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.id) {
        await UserService.AuthService.logout(req.user.id);
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });

    return ResponseFormatter.success(res, null, 'Sesión cerrada correctamente');
});

// ==========================================
// 2. RECUPERACIÓN DE CONTRASEÑA
// ==========================================

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        throw new ValidationError('El email es requerido');
    }

    await UserService.forgotPasswordService(email);

    return ResponseFormatter.success(res, null, 'Se ha enviado un correo de recuperación');
});

// ==========================================
// 2.2 RESET DE CONTRASEÑA
// ==========================================

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword) {
        throw new ValidationError('Token y contraseñas son requeridos');
    }

    if (newPassword !== confirmNewPassword) {
        throw new ValidationError('Las contraseñas no coinciden');
    }

    const result = await UserService.resetPasswordService(token, newPassword);

    if (!result) {
        throw new BadRequestError('No se pudo restablecer la contraseña');
    }

    return ResponseFormatter.success(res, null, 'Contraseña restablecida con éxito');
});

// ==========================================
// 3. CAMBIO DE CONTRASEÑA
// ==========================================

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!userId) throw new UnauthorizedError('Usuario no autenticado');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new ValidationError('Todas las contraseñas son requeridas');
    }

    if (newPassword !== confirmNewPassword) {
        throw new ValidationError('La nueva contraseña y su confirmación no coinciden');
    }

    if (currentPassword === newPassword) {
        throw new BadRequestError('La nueva contraseña no puede ser igual a la anterior');
    }

    await UserService.AuthService.changePassword(userId, currentPassword, newPassword);

    return ResponseFormatter.success(res, null, 'Contraseña actualizada correctamente');
});

// ==========================================
// 4. MFA (MULTI-FACTOR AUTH) - Pendientes
// ==========================================

export const setupMFA = asyncHandler(async (_req: Request, res: Response) => {
    return ResponseFormatter.success(res, null, 'MFA Setup (Pendiente de implementación)');
});

export const verifyMFASetup = asyncHandler(async (_req: Request, res: Response) => {
    return ResponseFormatter.success(res, null, 'MFA Verificado (Pendiente de implementación)');
});

export const validateMFA = asyncHandler(async (_req: Request, res: Response) => {
    return ResponseFormatter.success(res, null, 'MFA Validado (Pendiente de implementación)');
});

export const disableMFA = asyncHandler(async (_req: Request, res: Response) => {
    return ResponseFormatter.success(res, null, 'MFA Desactivado (Pendiente de implementación)');
});