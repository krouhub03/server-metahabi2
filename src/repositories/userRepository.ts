import BaseRepository from './base.repository';
import { User } from '../models';

/**
 * Repositorio especializado para la entidad User.
 * Hereda las operaciones CRUD básicas de BaseRepository.
 */
class UserRepository extends BaseRepository<User> {
    constructor() {
        // Pasamos el modelo User al constructor de la clase base
        super(User);
    }

    /**
     * Busca un usuario por su dirección de correo electrónico.
     * @param email - Correo a buscar.
     */
    async findByEmail(email: string): Promise<User | null> {
        return await this.model.findOne({ where: { email } });
    }

    /**
     * Busca un usuario por su nombre de usuario.
     * @param username - Nombre de usuario a buscar.
     */
    async findByUsername(username: string): Promise<User | null> {
        return await this.model.findOne({ where: { username } });
    }

    /**
     * Incrementa el puntaje total del usuario tras completar hábitos o tareas.
     * @param userId - ID del usuario.
     * @param points - Cantidad de puntos a sumar.
     */
    async updateScore(userId: string, points: number): Promise<any> {
        return await this.model.increment('total_score', {
            by: points,
            where: { id: userId }
        });
    }
}

// Exportamos una instancia única (Singleton) para ser usada en los servicios
export default UserRepository;