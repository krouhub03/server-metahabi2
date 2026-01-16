import { Response } from 'express';

// ===============================
// INTERFACES
// ===============================

// Estructura de la paginación que recibimos
export interface PaginationInput {
    page: number;
    limit: number;
    total: number;
}

// Estructura de la paginación que devolvemos
export interface PaginationOutput extends PaginationInput {
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Estructura general de la respuesta API
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: PaginationOutput;
    timestamp: string;
}

/**
 * Formateador centralizado de respuestas HTTP
 * Proporciona métodos consistentes para formatear respuestas de la API
 */
export default class ResponseFormatter {

    // ===============================
    // 2xx: Peticiones Correctas (Éxito)
    // ===============================

    /**
     * (200 OK) Respuesta exitosa genérica
     * @param res - Objeto response de Express
     * @param data - Datos a enviar en la respuesta (Opcional)
     * @param message - Mensaje descriptivo opcional
     */
    static success<T>(res: Response, data: T | null = null, message: string = 'Operación exitosa'): Response {
        const response: ApiResponse<T | null> = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        return res.status(200).json(response);
    }

    /**
     * (201 Created) La petición ha tenido éxito y se ha creado un nuevo recurso.
     * @param res - Objeto response de Express
     * @param data - Datos del recurso creado
     * @param message - Mensaje descriptivo
     */
    static created<T>(res: Response, data: T, message: string = 'Recurso creado exitosamente'): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        return res.status(201).json(response);
    }

    /**
     * (204 No Content) La petición se ha completado con éxito, pero no hay contenido que enviar.
     * @param res - Objeto response de Express
     */
    static noContent(res: Response): Response {
        return res.status(204).send();
    }

    /**
     * (200 OK) Respuesta con datos paginados
     * @param res - Objeto response de Express
     * @param data - Array de datos paginados
     * @param pagination - Objeto con info de paginación (page, limit, total)
     * @param message - Mensaje descriptivo
     */
    static paginated<T>(
        res: Response, 
        data: T[], 
        pagination: PaginationInput, 
        message: string = 'Datos obtenidos exitosamente'
    ): Response {
        const { page, limit, total } = pagination;
        const totalPages = Math.ceil(total / limit);

        const response: ApiResponse<T[]> = {
            success: true,
            message,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            timestamp: new Date().toISOString()
        };

        return res.status(200).json(response);
    }

    // ===============================
    // 3xx: Redirecciones
    // ===============================

    /**
     * (301 Moved Permanently) Redirección permanente a una nueva URL
     * @param res - Objeto response de Express
     * @param newUrl - Nueva URL a la que redirigir
     */
    static redirect(res: Response, newUrl: string): Response {
        return res.status(301).json({
            success: true,
            message: 'Recurso movido permanentemente',
            data: { newUrl },
            timestamp: new Date().toISOString()
        });
    }

    /** * (302 Found) Redirección temporal a una nueva URL
     * @param res - Objeto response de Express
     * @param newUrl - Nueva URL a la que redirigir
     */
    static found(res: Response, newUrl: string): Response {
        return res.status(302).json({
            success: true,
            message: 'Recurso encontrado',
            data: { newUrl },
            timestamp: new Date().toISOString()
        });
    }

    // Nota: Es probable que necesites métodos para errores (4xx, 5xx) aquí 
    // si quieres usar ResponseFormatter dentro de tu ErrorHandler.
    // Puedo agregarlos si los necesitas.
    
    static error(res: Response, message: string, statusCode: number = 500): Response {
        return res.status(statusCode).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    static badRequest(res: Response, message: string, errors: any[] = []): Response {
        return res.status(400).json({
            success: false,
            message,
            errors, // Útil para devolver detalles
            timestamp: new Date().toISOString()
        });
    }
    
    static unauthorized(res: Response, message: string): Response {
         return this.error(res, message, 401);
    }

    static forbidden(res: Response, message: string): Response {
         return this.error(res, message, 403);
    }

    static notFound(res: Response, message: string): Response {
         return this.error(res, message, 404);
    }
    
    static conflict(res: Response, message: string): Response {
         return this.error(res, message, 409);
    }

    static validationError(res: Response, errors: any[], message: string = 'Error de validación'): Response {
        return res.status(422).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }
}