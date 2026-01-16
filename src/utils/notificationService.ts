import webpush, { PushSubscription, WebPushError } from 'web-push';
import User from '../models/User.model';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// CONFIGURACIÓN E INTERFACES
// ==========================================

// Interfaz para los datos que recibimos al llamar la función
interface NotificationData {
    title?: string;
    body?: string;
    url?: string;
}

// Interfaz para el resultado interno de cada envío individual
interface PushResult {
    success: boolean;
    endpoint: string;
    shouldDelete: boolean;
}

// Interfaz para la respuesta final de la función
interface ServiceResponse {
    success: boolean;
    message?: string;
    sent?: number;
    cleaned?: number;
    error?: string;
}

// Validamos variables de entorno obligatorias
const vapidEmail = process.env.VAPID_EMAIL;
const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

if (!vapidEmail || !vapidPublic || !vapidPrivate) {
    console.warn('⚠️ Faltan variables de entorno VAPID. Las notificaciones no funcionarán.');
} else {
    // Configuramos VAPID
    webpush.setVapidDetails(
        `mailto:${vapidEmail}`,
        vapidPublic,
        vapidPrivate
    );
}

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================

/**
 * Envía una notificación push a un usuario específico mediante su ID.
 * Maneja automáticamente la limpieza de suscripciones vencidas.
 */
export const sendInternalNotification = async (
    targetUserId: string, 
    { title, body, url }: NotificationData
): Promise<ServiceResponse> => {
    
    try {
        // 1. Buscamos al usuario y sus suscripciones
        const user = await (User as any).findById(targetUserId);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!user.pushSubscription || user.pushSubscription.length === 0) {
            return { success: false, message: 'No subscriptions' };
        }

        // 2. Preparamos el Payload
        const payload = JSON.stringify({
            title: title || 'Nueva Notificación',
            body: body || 'Tienes un nuevo mensaje.',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: { 
                url: url || '/dashboard'
            }
        });

        // 3. Enviamos a TODOS los dispositivos registrados en paralelo
        // Mapeamos las promesas para procesarlas
        const promises = user.pushSubscription.map(async (subscription: PushSubscription): Promise<PushResult> => {
            try {
                await webpush.sendNotification(subscription, payload);
                return { success: true, endpoint: subscription.endpoint, shouldDelete: false };
            } catch (err: any) {
                // Casteamos el error a WebPushError para acceder a statusCode
                const error = err as WebPushError;

                // 4. Detección de suscripciones muertas (410 Gone / 404 Not Found)
                if (error.statusCode === 410 || error.statusCode === 404) {
                    return { success: false, endpoint: subscription.endpoint, shouldDelete: true };
                }
                
                // Otros errores (red, servidor push caído, etc.)
                console.error(`⚠️ Error enviando push a ${targetUserId}:`, error.statusCode);
                return { success: false, endpoint: subscription.endpoint, shouldDelete: false };
            }
        });

        // Esperamos a que todos los intentos terminen
        const results = await Promise.all(promises);

        // 5. LIMPIEZA AUTOMÁTICA EN BASE DE DATOS
        const subscriptionsToDelete = results
            .filter(r => r.shouldDelete)
            .map(r => r.endpoint);

        if (subscriptionsToDelete.length > 0) {
            await (User as any).findByIdAndUpdate(targetUserId, {
                $pull: { pushSubscription: { endpoint: { $in: subscriptionsToDelete } } }
            });
        }

        const successCount = results.filter(r => r.success).length;

        return { 
            success: true, 
            sent: successCount, 
            cleaned: subscriptionsToDelete.length 
        };

    } catch (error: any) {
        console.error("🔥 Error crítico en sendInternalNotification:", error);
        return { success: false, error: error.message || 'Unknown error' };
    }
};