import { Router } from 'express';
import { UsersManager } from '../dao/usersDBManager.js';
export const router=Router()

router.get ('/', async (req,res)=>{
try {
    let usuarios = await UsersManager.getUsers()
    res.setHeader('Content-Type','application/json');
    return res.status(200).json({usuarios});
} catch (error) {
    console.log(error);
    res.setHeader('Content-Type','application/json');
    return res.status(500).json(
        {
            error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle:`${error.message}`
        }
    )
    
}
    
})