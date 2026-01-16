import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 1. Interfaz de Atributos (Lo que tiene el objeto completo)
interface PushSubscriptionAttributes {
    id: number;
    idUser: number;
    endpoint: string;
    p256dh: string; // Clave pública del cliente
    auth: string;   // Secreto de autenticación del cliente
}

// 2. Interfaz de Creación
// 'id' es opcional porque es auto-incremental.
// El resto son obligatorios para que la suscripción sea válida.
interface PushSubscriptionCreationAttributes extends Optional<PushSubscriptionAttributes, 'id'> {}

// 3. Definición de la Clase
class PushSubscription extends Model<PushSubscriptionAttributes, PushSubscriptionCreationAttributes> 
    implements PushSubscriptionAttributes {
    
    public id!: number;
    public idUser!: number;
    public endpoint!: string;
    public p256dh!: string;
    public auth!: string;

    // timestamps: false, por lo que no definimos createdAt/updatedAt
}

// 4. Inicialización
PushSubscription.init(
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
        endpoint: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        p256dh: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        auth: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'PushSubscription',
        timestamps: false,
        underscored: true
    }
);

export default PushSubscription;