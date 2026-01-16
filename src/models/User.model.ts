import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Tipo para el estado de la cuenta
export type UserAccountStatus = 'active' | 'suspended' | 'deleted';

// 1. Interfaz de Atributos (Lo que tiene el usuario ya cargado de BD)
interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    name: string | null;
    surname: string | null;
    preferences_timezone: string | null;
    frog_deadline_time: string; // TIME en SQL se maneja como string 'HH:MM:SS'
    total_score: number;
    level: number;
    experience_points: number;
    mfa_enabled: boolean;
    mfa_secret: string | null;
    last_login: Date | null;
    account_status: UserAccountStatus;
    reset_password_token: string | null;
    reset_password_expires: Date | null;
    refresh_token: string | null;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Interfaz de Creación
// Campos que son OPCIONALES al hacer User.create(...)
// (Ya sea porque son auto-incrementales, nullables o tienen defaultValues)
interface UserCreationAttributes extends Optional<UserAttributes, 
    'id' | 'name' | 'surname' | 'preferences_timezone' | 
    'frog_deadline_time' | 'total_score' | 'level' | 'experience_points' | 
    'mfa_enabled' | 'mfa_secret' | 'last_login' | 'account_status' | 
    'reset_password_token' | 'reset_password_expires' | 'refresh_token' | 
    'createdAt' | 'updatedAt'
> {}

// 3. Definición de la Clase
class User extends Model<UserAttributes, UserCreationAttributes> 
    implements UserAttributes {
    
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public name!: string | null;
    public surname!: string | null;
    public preferences_timezone!: string | null;
    public frog_deadline_time!: string;
    public total_score!: number;
    public level!: number;
    public experience_points!: number;
    public mfa_enabled!: boolean;
    public mfa_secret!: string | null;
    public last_login!: Date | null;
    public account_status!: UserAccountStatus;
    public reset_password_token!: string | null;
    public reset_password_expires!: Date | null;
    public refresh_token!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// 4. Inicialización
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        surname: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        preferences_timezone: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        frog_deadline_time: {
            type: DataTypes.TIME,
            defaultValue: '11:00:00'
        },
        total_score: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        experience_points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        mfa_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        mfa_secret: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        account_status: {
            type: DataTypes.ENUM('active', 'suspended', 'deleted'),
            defaultValue: 'active'
        },
        reset_password_token: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        refresh_token: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'User',
        timestamps: true,
        underscored: true
    }
);

export default User;