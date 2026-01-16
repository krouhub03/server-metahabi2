import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';
import { AuthRequest } from './auth.middleware'; // Importamos la interfaz que creamos antes

// Definimos que el argumento puede ser un string (ej: 'crear_tarea') 
// o un Modelo estático de Sequelize (ej: Goal)
type LimitTarget = string | ModelStatic<Model<any, any>>;

export const checkPlanLimit = (target: LimitTarget) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Accedemos al usuario de forma segura gracias a AuthRequest
            const user = (req as AuthRequest).user;

            // Validación de seguridad: si no hay usuario o es un string (no objeto), fallamos
            if (!user || typeof user === 'string' || !('id' in user)) {
                return res.status(401).json({ message: 'Usuario no identificado o token inválido' });
            }

            const userId = user.id;

            // 2. Lógica del Middleware
            if (typeof target === 'string') {
                if (target === 'crear_tarea') {
                    console.log("Verificando límite de plan para el usuario:", userId);
                    // Aquí iría tu lógica real de límite para tareas
                    next();
                } else {
                    // Si pasas un string desconocido, dejamos pasar o lanzamos error según prefieras
                    next();
                }
            } else {
                // 3. Lógica para Modelos Sequelize
                // Mongoose usaba: target.countDocuments({ id_usuario: ... })
                // Sequelize usa: target.count({ where: { idUser: ... } })
                
                const count = await target.count({ 
                    where: { idUser: userId } 
                });

                console.log(`Usuario ${userId} ha creado ${count} registros en ${target.name}.`);
                
                // TODO: Aquí deberías añadir la condición real, por ejemplo:
                // const PLAN_LIMIT = 5;
                // if (count >= PLAN_LIMIT) {
                //    return res.status(403).json({ message: 'Has alcanzado el límite de tu plan.' });
                // }

                // 4. ¡IMPORTANTE! En tu código original faltaba el next() aquí,
                // lo que hacía que la petición se quedara cargando infinitamente.
                next(); 
            }
        } catch (error) {
            console.error('Error en checkPlanLimit:', error);
            res.status(500).json({ message: "Error al verificar el plan" });
        }
    };
};