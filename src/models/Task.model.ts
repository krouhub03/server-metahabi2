import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 1. Interfaz de Atributos
interface TaskAttributes {
    id: number;
    idUser: number;
    idSubGoal: number | null;
    title: string | null;
    description: string | null;
    priority: number | null;
    difficulty: number | null;
    type: number | null;
    startDate: Date | null;      // DataTypes.DATE incluye hora
    limitDate: Date | null;
    status: number | null;       // Podrías usar un Enum aquí si tienes estados fijos
    completionDate: Date | null;
    time: number | null;         // Tiempo estimado o invertido

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Interfaz de Creación
// id es auto. idUser es obligatorio. El resto parece opcional/nullable según tu JS.
interface TaskCreationAttributes extends Optional<TaskAttributes, 
    'id' | 'idSubGoal' | 'title' | 'description' | 'priority' | 
    'difficulty' | 'type' | 'startDate' | 'limitDate' | 'status' | 
    'completionDate' | 'time' | 'createdAt' | 'updatedAt'
> {}

// 3. Clase del Modelo
class Task extends Model<TaskAttributes, TaskCreationAttributes> 
    implements TaskAttributes {
    
    public id!: number;
    public idUser!: number;
    public idSubGoal!: number | null;
    public title!: string | null;
    public description!: string | null;
    public priority!: number | null;
    public difficulty!: number | null;
    public type!: number | null;
    public startDate!: Date | null;
    public limitDate!: Date | null;
    public status!: number | null;
    public completionDate!: Date | null;
    public time!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// 4. Inicialización
Task.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id'
            }
        },
        idSubGoal: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'subGoal', // Asegúrate de que coincida con tableName en SubGoal.ts
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        difficulty: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        limitDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        completionDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        time: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'tasks', // Plural y minúsculas forzado
        modelName: 'Task',
        timestamps: true,
        underscored: true
    }
);

export default Task;