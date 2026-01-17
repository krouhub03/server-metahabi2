import { Router } from 'express';

const router: Router = Router();

// Registar usaurio
router.post('/register', (req , res)=>{res.json({tes:"hola mundo !"})});
// Cerar sesion 
router.post('/logout', (req , res)=>{res.json({tes:"hola mundo !"})});
// resetear constraseña 
router.post('/reset-password', (req , res)=>{res.json({tes:"hola mundo !"})});
// Cambiar contraseña
router.post('/forgot-password', (req , res)=>{res.json({tes:"hola mundo !"})});
// inicair sesion
router.post('/login',(req , res)=>{res.json({tes:"hola mundo !"})})
export default router;