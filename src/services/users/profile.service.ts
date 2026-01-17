import UserRepository  from '../../repositories/index';
import user from '../../models/User.model'
/**
 * Interface que define los campos permitidos para la actualización manual.
 */
export interface UserProfileUpdate {
    name?: string;
    surname?: string;
    preferences_timezone?: string;
    frog_deadline_time?: string;
}

/**
 * Obtiene el perfil completo y actualizado del usuario.
 * @param userId - ID del usuario.
 * @returns El objeto JSON del usuario sin datos sensibles.
 */
export const getUserProfile = async (userId: string): Promise<Record<string, any>> => {
const user = await UserRepository.findById(userId); 
    if (!user) throw new Error('Usuario no encontrado');

    // Extraemos solo lo necesario para el perfil
    const userJson = user.toJSON();
    
    // Eliminamos datos sensibles que nunca deben llegar al cliente
    const sensitiveFields = [
        'id',
        'username',
        'password',
        'refresh_token',
        'mfa_secret',
        'reset_password_token',
        'reset_password_expires',
        'created_at',
        'updated_at',
        'account_status'
    ];

    sensitiveFields.forEach(field => delete userJson[field]);

    return userJson;
};

/**
 * Actualiza los datos del perfil y maneja lógica de negocio.
 * @param userId - ID del usuario a actualizar.
 * @param updateData - Datos enviados desde el cliente.
 */
export const updateProfile = async (
    userId: string, 
    updateData: Partial<UserProfileUpdate>
): Promise<any> => {
    // Campos permitidos para actualización manual por el usuario
    const allowedUpdates: (keyof UserProfileUpdate)[] = [
        'name', 
        'surname', 
        'preferences_timezone', 
        'frog_deadline_time'
    ];

    // Filtramos el objeto para quedarnos solo con las claves permitidas y con valor definido
    const filteredData = Object.keys(updateData)
        .filter((key): key is keyof UserProfileUpdate => 
            allowedUpdates.includes(key as keyof UserProfileUpdate)
        )
        .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
        }, {} as UserProfileUpdate);

    // Ejecutamos la actualización en el repositorio
    const updatedUser = await UserRepository.update(userId, filteredData);
    
    return updatedUser;
};