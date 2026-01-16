import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 1. Interfaz que define todos los atributos que tiene el modelo
interface DailyFrogAttributes {
    id: number;
    idUser: number;
    id_task: number;
    frog_date: string; // DATEONLY se maneja como string ('YYYY-MM-DD')
    completed: boolean;
}

// 2. Interfaz para la creación (CreationAttributes)
// Usamos 'Optional' para indicar qué campos NO son obligatorios al hacer un .create()
// (id es autoincremental y completed tiene un defaultValue)
interface DailyFrogCreationAttributes extends Optional<DailyFrogAttributes, 'id' | 'completed'> {}

// 3. Definición de la Clase Modelo
class DailyFrog extends Model<DailyFrogAttributes, DailyFrogCreationAttributes> 
    implements DailyFrogAttributes {
    
    public id!: number;
    public idUser!: number;   // Al usar underscored: true, en BD será 'id_user'
    public id_task!: number;
    public frog_date!: string;
    public completed!: boolean;

    // Nota: Como timestamps es false, no declaramos createdAt ni updatedAt
}

// 4. Inicialización del esquema
DailyFrog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // field: 'id_user', // Implícito por 'underscored: true'
            references: {
                model: 'User', // Nombre de la tabla de usuarios
                key: 'id'
            }
        },
        id_task: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tasks', // Nombre de la tabla de tareas
                key: 'id'
            }
        },
        frog_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize, // Pasamos la instancia de conexión importada
        tableName: 'DailyFrog',
        timestamps: false, // El registro se basa en frog_date
        underscored: true, // Convierte camelCase (idUser) a snake_case (id_user) automáticamente
        indexes: [
            {
                unique: true,
                fields: ['id_user', 'frog_date'],
                name: 'unique_user_date'
            }
        ]
    }
);

export default DailyFrog;