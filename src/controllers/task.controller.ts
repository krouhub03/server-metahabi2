import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Task } from '../models';
import { 
    asyncHandler, 
    NotFoundError, 
    UnauthorizedError, 
    BadRequestError 
} from '../utils/responseErrors';
import ResponseFormatter from '../utils/responseFormatter';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string; // El ID del JWT suele venir como string
        [key: string]: any;
    };
}

// ==========================================
// 1. OBTENER TAREAS (Todas o por fecha)
// ==========================================
export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { fecha } = req.query;
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError('Usuario no identificado');

    // Convertimos a número para la consulta si la base de datos usa enteros
    const whereClause: any = { idUser: Number(userId) };

    if (fecha) {
        const dateStr = fecha as string;
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);

        whereClause.startDate = {
            [Op.between]: [start, end]
        };
    }

    const tasks = await Task.findAll({
        where: whereClause,
        order: [['priority', 'ASC']]
    });

    return ResponseFormatter.success(res, tasks, 'Tareas obtenidas correctamente');
});

// ==========================================
// 2. OBTENER UNA SOLA TAREA
// ==========================================
export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Conversión explícita a número para findByPk
    const task = await Task.findByPk(Number(id));

    if (!task) throw new NotFoundError('Tarea');
    
    // Comparación numérica: convertimos userId a número
    if (task.idUser !== Number(userId)) {
        throw new UnauthorizedError('No tienes permiso para ver esta tarea');
    }

    return ResponseFormatter.success(res, task);
});

// ==========================================
// 3. CREAR TAREA
// ==========================================
export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { 
        title, description, priority, difficulty, 
        type, startDate, limitDate, time, idSubGoal 
    } = req.body;

    if (!title) throw new BadRequestError('El título es obligatorio');

    const task = await Task.create({
        idUser: Number(userId),
        idSubGoal: idSubGoal || null,
        title,
        description,
        priority: priority || 2,
        difficulty: difficulty || 1,
        type,
        startDate,
        limitDate,
        time,
        status: 0 
    });

    return ResponseFormatter.created(res, task, 'Tarea creada exitosamente');
});

// ==========================================
// 4. ALTERNAR ESTADO (Pendiente <-> Completada)
// ==========================================
export const toggleTaskStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findByPk(Number(id));

    if (!task) throw new NotFoundError('Tarea');
    if (task.idUser !== Number(userId)) throw new UnauthorizedError('No autorizado');

    const newStatus = task.status === 1 ? 0 : 1;
    
    await task.update({ 
        status: newStatus,
        completionDate: newStatus === 1 ? new Date() : null 
    });

    return ResponseFormatter.success(res, task, 'Estado de la tarea actualizado');
});

// ==========================================
// 5. ACTUALIZAR TAREA
// ==========================================
export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findByPk(Number(id));

    if (!task) throw new NotFoundError('Tarea');
    if (task.idUser !== Number(userId)) throw new UnauthorizedError('No autorizado');

    await task.update(req.body);

    return ResponseFormatter.success(res, task, 'Tarea actualizada correctamente');
});

// ==========================================
// 6. ELIMINAR TAREA
// ==========================================
export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findByPk(Number(id));

    if (!task) throw new NotFoundError('Tarea');
    if (task.idUser !== Number(userId)) throw new UnauthorizedError('No autorizado');

    await task.destroy();

    return ResponseFormatter.success(res, null, 'Tarea eliminada');
});