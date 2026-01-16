// --- Interfaces para los Reportes ---

export interface HabitStats {
    name: string;
    completedCount: number;
    targetCount: number;
    percentage: number;
    completed?: boolean;
}

export interface WeeklyReportData {
    userId: string;
    stats: {
        completed: number;
        streak: number;
        successRate: number;
    };
    habits: HabitStats[];
}

export interface MonthlyReportData {
    userId: string;
    period: 'monthly';
    generatedAt: Date;
    // Aquí puedes expandir más campos para el reporte mensual
}

// --- Funciones de Lógica ---

/**
 * Genera reporte semanal para un usuario
 */
export const generateWeeklyReport = async ({ userId }: { userId: string }): Promise<WeeklyReportData> => {
    console.log(`📊 Generando reporte semanal para usuario ${userId}`);
    
    // NOTA: Aquí inyectarás tus Repositories/Services en el futuro
    // Ejemplo: const habits = await habitService.getWeeklySummary(userId);
    
    const mockData: WeeklyReportData = {
        userId,
        stats: {
            completed: 42,
            streak: 14,
            successRate: 87
        },
        habits: [
            { name: 'Ejercicio', completedCount: 6, targetCount: 7, percentage: 86, completed: false },
            { name: 'Meditación', completedCount: 7, targetCount: 7, percentage: 100, completed: true },
            { name: 'Leer', completedCount: 5, targetCount: 7, percentage: 71, completed: false }
        ]
    };
    
    return mockData;
};

/**
 * Genera reporte mensual para un usuario
 */
export const generateMonthlyReport = async ({ userId }: { userId: string }): Promise<MonthlyReportData> => {
    console.log(`📈 Generando reporte mensual para usuario ${userId}`);
    
    return {
        userId,
        period: 'monthly',
        generatedAt: new Date()
    };
};