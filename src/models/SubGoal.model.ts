import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 1. Interfaz de Atributos
interface SubGoalAttributes {
    id: number;
    idGoal: number;
    title: string;
    description: string | null;
    startDate: string | null; // DATEONLY se maneja como string 'YYYY-MM-DD'
    limitDate: string | null;
    state: boolean;           // En este modelo es boolean, a diferencia de Goal que era Enum
    progress_percentage: number;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Interfaz de Creación
// Campos opcionales al crear (id es auto, los demás tienen defaults o son nullables)
interface SubGoalCreationAttributes extends Optional<SubGoalAttributes, 
    'id' | 'description' | 'startDate' | 'limitDate' | 'state' | 
    'progress_percentage' | 'createdAt' | 'updatedAt'
> {}

// 3. Clase del Modelo
class SubGoal extends Model<SubGoalAttributes, SubGoalCreationAttributes> 
    implements SubGoalAttributes {
    
    public id!: number;
    public idGoal!: number;
    public title!: string;
    public description!: string | null;
    public startDate!: string | null;
    public limitDate!: string | null;
    public state!: boolean;
    public progress_percentage!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// 4. Inicialización
SubGoal.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idGoal: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Goal',
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
        state: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        progress_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        }
    },
    {
        sequelize,
        tableName: 'subGoal', // Nombre exacto de la tabla
        timestamps: true,
        underscored: true,     // Esto maneja automáticamente created_at y updated_at
        
        // Mantenemos esto explícito por si acaso tu DB vieja no sigue la convención exacta
        createdAt: 'created_at',
        updatedAt: 'updated_at' 
    }
);

export default SubGoal;