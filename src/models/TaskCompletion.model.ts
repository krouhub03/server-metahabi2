import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 1. Interfaz de Atributos
interface TaskCompletionAttributes {
    id: number;
    idTask: number;
    idUser: number;
    completion_timestamp: Date;
    earned_score: number;
}

// 2. Interfaz de Creación
// - id: Auto-incremental (Opcional)
// - completion_timestamp: Tiene defaultValue NOW (Opcional)
// - idTask, idUser, earned_score: Obligatorios
interface TaskCompletionCreationAttributes extends Optional<TaskCompletionAttributes, 
    'id' | 'completion_timestamp'
> {}

// 3. Clase del Modelo
class TaskCompletion extends Model<TaskCompletionAttributes, TaskCompletionCreationAttributes> 
    implements TaskCompletionAttributes {
    
    public id!: number;
    public idTask!: number;
    public idUser!: number;
    public completion_timestamp!: Date;
    public earned_score!: number;
}

// 4. Inicialización
TaskCompletion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idTask: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tasks', // Coincide con el tableName definido en Task.ts
                key: 'id'
            }
        },
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id'
            }
        },
        completion_timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        earned_score: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'TaskCompletion',
        timestamps: false, // Usamos completion_timestamp
        underscored: true
    }
);

export default TaskCompletion;