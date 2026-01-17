//server\controllers\billingController.js
const User = require('../models/User.model');

// @desc    Obtener información del plan actual
// @route   GET /api/billing/plan
const getPlanStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('plan');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar a Premium (Simulación o Webhook de Stripe/PayPal)
// @route   POST /api/billing/upgrade
const upgradePlan = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        user.plan = 'Premium';
        await user.save();

        res.status(200).json({ 
            message: '¡Felicidades! Ahora eres usuario Premium 🚀',
            plan: user.plan 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPlanStatus, upgradePlan };