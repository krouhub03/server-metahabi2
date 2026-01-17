// server/controllers/profileController.js
const ResponseFormatter = require('../utils/responseFormatter');
// Importamos las CLASES de error y el helper asyncHandler
const {
    asyncHandler,
    NotFoundError,
    ValidationError
} = require('../utils/responseErrors');

const ProfileService = require('../services/users');

// ==========================================
// 1. OBTENER PERFIL DE USUARIO
// ==========================================
const getProfile = asyncHandler(async (req, res) => {
    const userProfile = await ProfileService.getUserProfile(req.user.id);

    if (!userProfile) {
        // Usamos la CLASE NotFoundError
        throw new NotFoundError('Usuario');
    }

    return ResponseFormatter.success(
        res,
        { user: userProfile },
        'Perfil obtenido exitosamente'
    );
});

// ==========================================
// 2. ACTUALIZAR PERFIL DE USUARIO
// ==========================================
const updateProfile = asyncHandler(async (req, res) => {
    // 1. Llamada al servicio
    const updatedUser = await ProfileService.updateProfile(req.user.id, req.body);

    // 2. Verificación de existencia
    if (!updatedUser) {
        // Usamos la CLASE NotFoundError
        throw new NotFoundError('Usuario');
    }

    return ResponseFormatter.success(
        res,
        { user: updatedUser },
        'Perfil actualizado correctamente'
    );
});

module.exports = {
    getProfile,
    updateProfile
};