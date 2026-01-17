import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * ============================================
 * AUTH VALIDATOR - MetaHabit (TypeScript)
 * ============================================
 */

// --- SCHEMAS ---

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder 30 caracteres',
      'any.required': 'El nombre de usuario es obligatorio'
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Debe proporcionar un email válido',
      'any.required': 'El email es obligatorio'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)',
      'any.required': 'La contraseña es obligatoria'
    }),

  name: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .allow(null, '')
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),

  surname: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .allow(null, '')
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 255 caracteres'
    }),

  preferences_timezone: Joi.string()
    .valid(...Intl.supportedValuesOf('timeZone'))
    .default('UTC')
    .messages({
      'any.only': 'Zona horaria no válida. Debe ser una zona horaria IANA válida (ej: America/Bogota)'
    }),

  frog_deadline_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .default('11:00:00')
    .messages({
      'string.pattern.base': 'La hora límite debe estar en formato HH:MM:SS (24 horas)'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es obligatorio'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es obligatoria'
    }),

  mfaCode: Joi.string()
    .pattern(/^\d{6}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'El código MFA debe ser de 6 dígitos numéricos'
    }),

  rememberMe: Joi.boolean().default(false)
});

export const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  name: Joi.string().min(2).max(255).trim().allow(null, ''),
  surname: Joi.string().min(2).max(255).trim().allow(null, ''),
  preferences_timezone: Joi.string().valid(...Intl.supportedValuesOf('timeZone')),
  frog_deadline_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .invalid(Joi.ref('currentPassword'))
    .required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required()
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

export const setupMFASchema = Joi.object({
  mfaCode: Joi.string().pattern(/^\d{6}$/).required()
});

export const verifyMFASchema = Joi.object({
  mfaCode: Joi.string().pattern(/^\d{6}$/).required()
});

export const disableMFASchema = Joi.object({
  password: Joi.string().required(),
  mfaCode: Joi.string().pattern(/^\d{6}$/).required()
});

export const emailSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required()
});

// --- MIDDLEWARES ---

const handleError = (res: Response, error: Joi.ValidationError, message: string) => {
  const errors = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message
  }));
  return res.status(400).json({ success: false, message, errors });
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return handleError(res, error, 'Error de validación en el registro');
  
  const { confirmPassword, ...userData } = value;
  req.body = userData;
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
  
  req.body = value;
  next();
};

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return handleError(res, error, 'Error de validación');
  
  req.body = value;
  next();
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return handleError(res, error, 'Error de validación');
  
  req.body = value;
  next();
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = forgotPasswordSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ success: false, message: 'Email inválido' });
  
  req.body = value;
  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return handleError(res, error, 'Error de validación');
  
  req.body = value;
  next();
};

export const validateSetupMFA = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = setupMFASchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ success: false, message: 'Código MFA inválido' });
  
  req.body = value;
  next();
};

export const validateVerifyMFA = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = verifyMFASchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ success: false, message: 'Código MFA inválido' });
  
  req.body = value;
  next();
};

export const validateDisableMFA = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = disableMFASchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return handleError(res, error, 'Error de validación');
  
  req.body = value;
  next();
};

export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = emailSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ success: false, message: 'Email inválido' });
  
  req.body = value;
  next();
};