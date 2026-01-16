import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 1. Interfaz de Atributos
interface IdentityAttributes {
    id: number;
    idUser: number;
    title: string;
    color: string | null;
    identity_statement: string | null;
    core_values: any | null; // Puedes cambiar 'any' por una interfaz específica si sabes la estructura del JSON
    consolidation_level: number;
    total_votes: number;
    icon: string | null;
    is_active: boolean;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Interfaz de Creación
// Campos opcionales al crear: id (auto), defaults (consolidation_level, etc.) y nullables
interface IdentityCreationAttributes extends Optional<IdentityAttributes, 
    'id' | 'color' | 'identity_statement' | 'core_values' | 
    'consolidation_level' | 'total_votes' | 'icon' | 'is_active' | 
    'createdAt' | 'updatedAt'
> {}

// 3. Clase del Modelo
class Identity extends Model<IdentityAttributes, IdentityCreationAttributes> 
    implements IdentityAttributes {
    
    public id!: number;
    public idUser!: number;
    public title!: string;
    public color!: string | null;
    public identity_statement!: string | null;
    public core_values!: any | null;
    public consolidation_level!: number;
    public total_votes!: number;
    public icon!: string | null;
    public is_active!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// 4. Inicialización
Identity.init(
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
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        identity_statement: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        core_values: {
            type: DataTypes.JSON,
            allowNull: true
        },
        consolidation_level: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_votes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        tableName: 'Identity',
        timestamps: true,
        underscored: true
    }
);

export default Identity;