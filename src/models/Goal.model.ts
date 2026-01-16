import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Definimos tipos específicos para los Enums para mejor autocompletado
export type GoalState = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalPriority = 'A' | 'B' | 'C' | 'D' | 'E';

// 1. Interfaz de Atributos (Lo que tiene el modelo)
interface GoalAttributes {
    id: number;
    idUser: number;
    idIdentity: number | null;
    title: string;
    description: string | null;
    startDate: string | null; // DATEONLY suele usarse como string 'YYYY-MM-DD'
    limitDate: string | null;
    year: number | null;
    is_annual: boolean;
    state: GoalState;
    priority: GoalPriority;
    progress_percentage: number;
    
    // Timestamps (porque timestamps: true)
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Interfaz de Creación (Campos opcionales al crear)
// id es autoIncrement, los demás tienen defaultValue o allowNull: true
interface GoalCreationAttributes extends Optional<GoalAttributes, 
    'id' | 'idIdentity' | 'description' | 'startDate' | 'limitDate' | 
    'year' | 'is_annual' | 'state' | 'priority' | 'progress_percentage' | 
    'createdAt' | 'updatedAt'
> {}

// 3. Clase del Modelo
class Goal extends Model<GoalAttributes, GoalCreationAttributes> 
    implements GoalAttributes {
    
    public id!: number;
    public idUser!: number;
    public idIdentity!: number | null;
    public title!: string;
    public description!: string | null;
    public startDate!: string | null;
    public limitDate!: string | null;
    public year!: number | null;
    public is_annual!: boolean;
    public state!: GoalState;
    public priority!: GoalPriority;
    public progress_percentage!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// 4. Inicialización
Goal.init(
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
        idIdentity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Identity',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        limitDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_annual: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        state: {
            type: DataTypes.ENUM('active', 'completed', 'paused', 'cancelled'),
            defaultValue: 'active'
        },
        priority: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
            defaultValue: 'C'
        },
        progress_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        }
    },
    {
        sequelize,
        tableName: 'Goal',
        timestamps: true,
        underscored: true
    }
);

export default Goal;