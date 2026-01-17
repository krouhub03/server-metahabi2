import { Model, ModelStatic, FindOptions, Includeable } from 'sequelize';

/**
 * Clase base genérica para repositorios de Sequelize.
 * @template T - El modelo de Sequelize que extiende de Model.
 */
class BaseRepository<T extends Model> {
    protected model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    /**
     * Obtiene todos los registros que coincidan con las opciones.
     */
    async findAll(options: FindOptions = {}): Promise<T[]> {
        return await this.model.findAll(options);
    }

    /**
     * Busca un registro por su Primary Key (ID).
     */
    async findById(id: string | number, include: Includeable[] = []): Promise<T | null> {
        return await this.model.findByPk(id, { include });
    }

    /**
     * Crea un nuevo registro en la base de datos.
     */
    async create(data: any): Promise<T> {
        return await this.model.create(data);
    }

    /**
     * Actualiza un registro existente por su ID.
     * @returns El número de filas afectadas.
     */
    async update(id: string | number, data: any): Promise<number> {
        const [affectedCount] = await this.model.update(data, { 
            where: { id } as any 
        });
        return affectedCount;
    }

    /**
     * Elimina un registro por su ID.
     * @returns El número de filas eliminadas.
     */
    async delete(id: string | number): Promise<number> {
        return await this.model.destroy({ 
            where: { id } as any 
        });
    }
}

export default BaseRepository;