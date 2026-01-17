import BaseRepository from './base.repository';
import User  from '../models/User.model';

/**
 * Repositorio encargado de la gestión de planes y facturación del usuario.
 */
class BillingRepository extends BaseRepository<User> {
    constructor() {
        // Inicializamos la clase base con el modelo User
        super(User);
    }

    /**
     * Obtiene específicamente el plan actual del usuario.
     * @param userId - ID único del usuario.
     * @returns Instancia de usuario con solo el atributo 'plan'.
     */
    async getUserPlan(userId: string): Promise<User | null> {
        // En TypeScript, findByPk devolverá un tipo User gracias al genérico
        return await this.model.findByPk(userId, {
            attributes: ['plan']
        });
    }

    /**
     * Actualiza el plan del usuario (ej: de 'free' a 'premium').
     * @param userId - ID del usuario a actualizar.
     * @param newPlan - Nombre del nuevo plan.
     * @returns Una promesa con el resultado de la actualización.
     */
    async updatePlan(userId: string, newPlan: string): Promise<[number]> {
        // Tipamos el retorno como [number] ya que Sequelize update devuelve un array
        // con el número de filas afectadas.
        return await this.model.update(
            { plan: newPlan },
            { where: { id: userId } }
        );
    }
}

// Exportamos la instancia única (Singleton)
export default new BillingRepository();