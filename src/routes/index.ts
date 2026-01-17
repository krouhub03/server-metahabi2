//src\routes\index.ts
import { Router } from 'express';
// ✅ DEBES AÑADIR ESTA LÍNEA (asegúrate de que el nombre del archivo coincida)
import authRoutes from './auth.routes'
const router = Router();

// Aquí es donde TypeScript marcaba el error en la línea 14
router.use('/auth', authRoutes ); 


export default router;