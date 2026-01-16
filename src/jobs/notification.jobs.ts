// --- Interfaces para Tipado Estricto ---

export interface PushNotificationParams {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
}

export interface HabitReminderParams {
    userId: string;
    habitName: string;
    scheduledTime?: string | Date;
}

export interface StreakBrokenParams {
    userId: string;
    habitName: string;
    streakDays: number;
}

// --- Funciones de Lógica ---

/**
 * Envía una notificación push (implementación básica)
 */
export const sendPushNotification = async ({ 
    userId, 
    title, 
    body, 
    data = {} 
}: PushNotificationParams) => {
    console.log(`📱 Notificación push para usuario ${userId}:`, title);
    
    // NOTA: Aquí integrarás FCM (Firebase Cloud Messaging) en el futuro
    // Por ahora, simulamos el envío exitoso
    
    return {
        status: 'sent',
        userId,
        title,
        body,
        data,
        sentAt: new Date()
    };
};

/**
 * Envía recordatorio de hábito pendiente
 */
export const sendHabitReminder = async ({ 
    userId, 
    habitName 
}: HabitReminderParams) => {
    console.log(`⏰ Recordatorio de hábito para usuario ${userId}: ${habitName}`);
    
    return sendPushNotification({
        userId,
        title: `Recordatorio: ${habitName}`,
        body: `Es hora de completar tu hábito "${habitName}"`,
        data: {
            type: 'habit_reminder',
            habitName
        }
    });
};

/**
 * Notifica cuando se rompe una racha
 */
export const sendStreakBroken = async ({ 
    userId, 
    habitName, 
    streakDays 
}: StreakBrokenParams) => {
    console.log(`💔 Racha rota para usuario ${userId}: ${habitName} (${streakDays} días)`);
    
    return sendPushNotification({
        userId,
        title: '¡No te rindas!',
        body: `Tu racha de ${streakDays} días en "${habitName}" se rompió. ¡Empieza de nuevo hoy!`,
        data: {
            type: 'streak_broken',
            habitName,
            streakDays: String(streakDays) // FCM suele preferir strings en el objeto data
        }
    });
};