import { Router } from 'express';

const router: Router = Router();

router.get('/profile',(req , res)=>{res.json({tes:"hola mundo !"})})
router.patch('/profile',(req , res)=>{res.json({tes:"hola mundo !"})})
router.patch('/change-password',(req , res)=>{res.json({tes:"hola mundo !"})})


export default router;