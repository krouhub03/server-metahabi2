import bcrypt from 'bcryptjs';
import UserRepository from '../../repositories/userRepository';
import logger from '../../config/logger';
import { ValidationError, UnauthorizedError, NotFoundError, BadRequestError } from '../../utils/responseErrors';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken 
} from '../../utils/tokens';

/**
 * Interfaces para el tipado de datos de autenticación
 */
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Función interna para centralizar la creación de tokens.
 * Se asegura de que el ID sea tratado correctamente.
 */
const _generateTokens = (userId: number): TokenResponse => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

// ==========================================
// 1. REGISTRO DE USUARIO
// ==========================================
export const register = async (userData: any) => {
 
};

// ==========================================
// 2. INICIO DE SESIÓN
// ==========================================
export const login = async ({ email, username, password }: any) => {
  
 
};

// ==========================================
// 3. CIERRE DE SESIÓN
// ==========================================
export const logout = async (userId: string | number) => {

};

// ==========================================
// 4. CAMBIO DE CONTRASEÑA
// ==========================================
export const changePassword = async (userId: string | number, currentPassword: string, newPassword: string) => {
 };

// ==========================================
// 5. REFRESCO DE TOKEN
// ==========================================
export const refreshToken = async (token: string) => {
  
};