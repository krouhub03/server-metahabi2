// Importamos los modelos. 
// Asumo que ya has convertido (o convertirás) todos estos archivos a .ts
import User from './User.model'; 
import Identity from './Identity.model';
import Goal from './Goal.model';
import SubGoal from './SubGoal.model'; // Sugerencia: Renombra 'subGoal' a 'SubGoal' (PascalCase) para clases
import Habit from './Habit.model';
import Task from './Task.model';
import TaskCompletion from './TaskCompletion.model';
import DailyFrog from './DailyFrog.model';
import PushSubscription from './PushSubscription.model';

// ============================================
// RELACIONES DE USUARIO
// ============================================
User.hasMany(Identity, { foreignKey: 'idUser' });
Identity.belongsTo(User, { foreignKey: 'idUser' });

User.hasMany(Goal, { foreignKey: 'idUser' });
Goal.belongsTo(User, { foreignKey: 'idUser' });

User.hasMany(Habit, { foreignKey: 'idUser' });
Habit.belongsTo(User, { foreignKey: 'idUser' });

User.hasMany(Task, { foreignKey: 'idUser' });
Task.belongsTo(User, { foreignKey: 'idUser' });

User.hasMany(PushSubscription, { foreignKey: 'idUser' });
PushSubscription.belongsTo(User, { foreignKey: 'idUser' });

// ============================================
// RELACIONES DE IDENTIDAD (El núcleo del sistema)
// ============================================
Identity.hasMany(Goal, { foreignKey: 'idIdentity' });
Goal.belongsTo(Identity, { foreignKey: 'idIdentity' });

Identity.hasMany(Habit, { foreignKey: 'idIdentity' });
Habit.belongsTo(Identity, { foreignKey: 'idIdentity' });

Identity.hasMany(Task, { foreignKey: 'idIdentity' });
Task.belongsTo(Identity, { foreignKey: 'idIdentity' });

// ============================================
// RELACIONES DE OBJETIVOS
// ============================================
// Nota: 'as: subgoals' es importante para los includes: Goal.findOne({ include: 'subgoals' })
Goal.hasMany(SubGoal, { foreignKey: 'idGoal', as: 'subgoals' });
SubGoal.belongsTo(Goal, { foreignKey: 'idGoal' });

SubGoal.hasMany(Task, { foreignKey: 'idSubGoal' });
Task.belongsTo(SubGoal, { foreignKey: 'idSubGoal' });

// ============================================
// RELACIONES DE HÁBITOS Y TAREAS
// ============================================
Habit.hasMany(Task, { foreignKey: 'idHabit' });
Task.belongsTo(Habit, { foreignKey: 'idHabit' });

// Registro de completado (Log)
Task.hasMany(TaskCompletion, { foreignKey: 'idTask' });
TaskCompletion.belongsTo(Task, { foreignKey: 'idTask' });

User.hasMany(TaskCompletion, { foreignKey: 'idUser' });
TaskCompletion.belongsTo(User, { foreignKey: 'idUser' });

// ============================================
// RELACIONES DE DAILY FROG (La rana del día)
// ============================================
User.hasMany(DailyFrog, { foreignKey: 'idUser' });
DailyFrog.belongsTo(User, { foreignKey: 'idUser' });

Task.hasOne(DailyFrog, { foreignKey: 'idTask' });
DailyFrog.belongsTo(Task, { foreignKey: 'idTask' });

// ============================================
// EXPORTACIÓN
// ============================================
export {
    User,
    Identity,
    Goal,
    SubGoal,
    Habit,
    Task,
    TaskCompletion,
    DailyFrog,
    PushSubscription
};