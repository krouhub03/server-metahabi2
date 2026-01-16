import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Tipo para el ENUM de fase de vida
export type HabitLifecyclePhase = 'seed' | 'forming' | 'master';

// 1. Interfaz de Atributos (Propiedades que tiene el objeto una vez cargado)
interface HabitAttributes {
    id: number;
    idUser: number;
    idIdentity: number | null;
    title: string;
    description: string | null;
    frequency: string | null;
    lifecycle_phase: HabitLifecyclePhase;
    currentStreak: number;
    longestStreak: number;
    trigger_time: string | null; // TIME en SQL se maneja como string 'HH:MM:SS'
    is_negative_habit: boolean;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Interfaz de Creación (Propiedades requeridas al crear un nuevo registro)
// id es autoincremental. idUser y title son obligatorios. El resto son opcionales o tienen defaults.
interface HabitCreationAttributes extends Optional<HabitAttributes, 
    'id' | 'idIdentity' | 'description' | 'frequency' | 
    'lifecycle_phase' | 'currentStreak' | 'longestStreak' | 
    'trigger_time' | 'is_negative_habit' | 'createdAt' | 'updatedAt'
> {}

// 3. Definición de la Clase
class Habit extends Model<HabitAttributes, HabitCreationAttributes> 
    implements HabitAttributes {
    
    public id!: number;
    public idUser!: number;
    public idIdentity!: number | null;
    public title!: string;
    public description!: string | null;
    public frequency!: string | null;
    public lifecycle_phase!: HabitLifecyclePhase;
    public currentStreak!: number;
    public longestStreak!: number;
    public trigger_time!: string | null;
    public is_negative_habit!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// 4. Inicialización
Habit.init(
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
        frequency: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        lifecycle_phase: {
            type: DataTypes.ENUM('seed', 'forming', 'master'),
            defaultValue: 'seed'
        },
        currentStreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        longestStreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        trigger_time: {
            type: DataTypes.TIME,
            allowNull: true
        },
        is_negative_habit: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        tableName: 'Habit',
        timestamps: true,
        underscored: true // Importante: currentStreak se guarda como current_streak en BD
    }
);

export default Habit;