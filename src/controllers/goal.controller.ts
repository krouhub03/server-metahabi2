//server\controllers\goalController.js
const { Goal, SubGoal } = require('../models');

// @desc Registrar Meta 
const createGoal = async (req, res) => {
    console.log("Crear meta " , req.body)
    try {
        const { title, description, startDate, limitDate, priority, difficulty, state, reward } = req.body;

        const goal = await Goal.create({
            idUser: req.user.id, // Según tu diagrama
            title,
            description,
            startDate,
            limitDate,
            priority,
            difficulty,
            state,
            reward
        });

        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Editar Meta 
const updateGoal = async (req, res) => {
    try {
        const { title, description, limitDate, priority, state, difficulty, reward } = req.body;

        const goal = await Goal.findByPk(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Meta no encontrada' });
        }

        // Verificación de propiedad (idUser es INT en MySQL, comparamos directamente)
        if (goal.idUser !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        await goal.update({ 
            title, 
            description, 
            limitDate, 
            priority, 
            state, 
            difficulty, 
            reward 
        });

        res.status(200).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Eliminar meta
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findByPk(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Meta no encontrada' });
        }

        if (goal.idUser !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado para eliminar esta meta' });
        }

        // Al tener onDelete: 'CASCADE' en las asociaciones, 
        // MySQL borrará automáticamente las SubMetas vinculadas.
        await goal.destroy(); 

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar meta: ' + error.message });
    }
};

// @desc Obtener una Meta y sus SubMetas (Eager Loading)
const getSingleGoalWithSubGoals = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            where: { id: req.params.id, idUser: req.user.id },
            include: [{
                model: SubGoal,
                as: 'subgoals' // Debe coincidir con el alias en models/index.js
            }]
        });

        if (!goal) {
            return res.status(404).json({ message: 'Meta no encontrada' });
        }

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Obtener jerarquía completa (Todas las metas con sus hijos)
const getGoalHierarchy = async (req, res) => {
    try {
        const goals = await Goal.findAll({
            where: { idUser: req.user.id },
            include: [{
                model: SubGoal,
                as: 'subgoals'
            }],
            order: [['limitDate', 'ASC']] 
        });

        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createGoal, 
    updateGoal, 
    deleteGoal, 
    getGoalHierarchy, 
    getSingleGoalWithSubGoals 
};