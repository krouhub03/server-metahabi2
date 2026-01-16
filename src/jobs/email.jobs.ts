import transporter from '../config/nodemailer';

// --- Interfaces de Tipado ---

interface BaseEmailParams {
    to: string;
    name: string;
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

interface WeeklyReportParams extends BaseEmailParams {
    stats: {
        completed?: number;
        streak?: number;
        successRate?: number;
    };
    habits?: Array<{
        name: string;
        completed: boolean;
        completedCount: number;
        targetCount: number;
        percentage: number;
    }>;
}

// --- Funciones de Lógica ---

/**
 * Envía un email genérico (Wrapper del transporter)
 */
export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    console.log("📨 Intentando enviar correo a:", to, "| Asunto:", subject);

    try {
        const info = await transporter.sendMail({
            from: `"MetaHabit" <${process.env.EMAIL_FROM || 'noreply@metahabit.com'}>`,
            to,
            subject,
            html
        });

        console.log(`✅ Email enviado correctamente a ${to}: ${info.messageId}`);

        return {
            messageId: info.messageId,
            status: 'delivered',
            to
        };
    } catch (error: any) {
        console.error(`❌ Error fatal enviando email a ${to}:`, error.message);
        throw error;
    }
};

/**
 * Email de bienvenida al registrarse
 */
export const sendWelcomeEmail = async ({ to, name }: BaseEmailParams) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>¡Bienvenido a MetaHabit! 🎉</h1></div>
                <div class="content">
                    <h2>Hola ${name},</h2>
                    <p>Estamos emocionados de que te unas a nuestra comunidad.</p>
                    <ul>
                        <li>📊 Seguimiento de hábitos diarios</li>
                        <li>🔥 Mantener rachas de éxito</li>
                        <li>🎯 Alcanzar tus metas</li>
                    </ul>
                    <p style="text-align: center;">
                        <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" class="button">Ir a mi Dashboard</a>
                    </p>
                </div>
                <div class="footer"><p>© ${new Date().getFullYear()} MetaHabit.</p></div>
            </div>
        </body>
        </html>
    `;
    return sendEmail({ to, subject: '¡Bienvenido a MetaHabit! 🎉', html });
};

/**
 * Email de recuperación de contraseña
 */
export const sendPasswordRecovery = async ({ to, name, resetLink }: BaseEmailParams & { resetLink: string }) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #f44336; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>🔐 Recuperación de Contraseña</h1></div>
                <div class="content">
                    <h2>Hola ${name},</h2>
                    <p>Recibimos una solicitud para restablecer la contraseña.</p>
                    <p style="text-align: center;"><a href="${resetLink}" class="button">Restablecer Contraseña</a></p>
                    <div class="warning"><strong>⚠️ Importante:</strong> Este enlace expira en 1 hora.</div>
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail({ to, subject: 'Recuperación de Contraseña - MetaHabit', html });
};

/**
 * Email de reporte semanal
 */
export const sendWeeklyReport = async ({ to, name, stats, habits = [] }: WeeklyReportParams) => {
    const habitsHTML = habits.length > 0
        ? habits.map(habit => `
            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid ${habit.completed ? '#4caf50' : '#ff9800'};">
                <strong>${habit.name}</strong><br>
                <small>Completado: ${habit.completedCount}/${habit.targetCount} (${habit.percentage}%)</small>
            </div>
        `).join('')
        : '<p>No hay hábitos esta semana.</p>';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-box { background: white; padding: 15px; border-radius: 10px; text-align: center; flex: 1; margin: 0 5px; }
                .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>📊 Tu Reporte Semanal</h1></div>
                <div class="content">
                    <h2>Hola ${name},</h2>
                    <div class="stats">
                        <div class="stat-box"><div class="stat-number">${stats.completed || 0}</div><div>Hábitos</div></div>
                        <div class="stat-box"><div class="stat-number">${stats.streak || 0}</div><div>Racha</div></div>
                        <div class="stat-box"><div class="stat-number">${stats.successRate || 0}%</div><div>Éxito</div></div>
                    </div>
                    <h3>Tus Hábitos:</h3>
                    ${habitsHTML}
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail({ to, subject: `Tu Reporte Semanal - MetaHabit 📊`, html });
};

/**
 * Integración con Workers (ej: BullMQ)
 */
export const sendForgotPasswordEmail = async (job: { data: any }) => {
    if (!job?.data) throw new Error('El Job no contiene datos válidos');
    const { to, context } = job.data;
    return await sendPasswordRecovery({
        to,
        name: context.name,
        resetLink: context.link
    });
};

// Otras funciones (sendEmailVerification, sendStreakMilestone) seguirían el mismo patrón de exportación.