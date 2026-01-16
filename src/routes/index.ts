import { Router } from 'express';
// Aquí importaremos tus rutas modulares a medida que las convertimos
// import authRoutes from './auth.routes';
// import taskRoutes from './task.routes';
// ... etc

const router = Router();

// =============================================================================
// DEFINICIÓN DE RUTAS
// =============================================================================

// Auth
// router.use('/auth', authRoutes);

// Usuarios
router.use('/users', (req , res )=>{
  res.json(
    {
      nombre : "ddd"
    }
  )
});

// Tareas y Hábitos
// router.use('/tasks', taskRoutes);
// router.use('/habits', habitRoutes);

// Metas
// router.use('/goals', goalRoutes);

// =============================================================================
// RUTA DE PRUEBA (Para verificar que /api funciona)
// =============================================================================
router.get('/ping', (req, res) => {
    res.json({ message: 'Pong! API is working 🤖' });
});

export default router;