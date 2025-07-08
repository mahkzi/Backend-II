import { Router } from 'express';
import passport from 'passport'; 
import jwt from 'jsonwebtoken'; 
import { config } from '../config/config.js';

export const router = Router();

router.post("/register", 
    passport.authenticate("register", {session:false, failureRedirect:"/api/sessions/error"}),
    (req, res ) => {
       const registeredUser = req.user;

       const token = jwt.sign(registeredUser, config.JWT_SECRET, {expiresIn:"1h"});

       res.cookie("cookieToken", token, {httpOnly:true});

       return res.status(200).json({
         status: 'success',
        message: 'Inicio de sesión exitoso!',
       });
    }
);

router.post("/login",
    passport.authenticate("login", {session:false, failureRedirect:"/api/sessions/error"}),
    (req, res) => {
       
        const loggedInUser = req.user;

 
        res.cookie("cookieToken", token, { httpOnly: true });

        return res.status(200).json({
            status: 'success',
            message: '¡Inicio de sesión exitoso!',
            usuarioLogueado: loggedInUser
        });
    }
);

router.get("/error", (req, res) => {
    res.setHeader('Content-Type','application/json');
   const errorMessage = req.authInfo?.message || `Error al autenticar. Credenciales inválidas o token expirado/inválido.`;
    return res.status(401).json({message: errorMessage });
});

router.get("/current", passport.authenticate("current", {sessions:false, failureRedirect:"/api/sessions/error"})),
(req, res) => {
    res.setHeader('Content-Type','application/json');
    return res.status(200).json({
         status: 'success',
        message: 'Usuario autenticado correctamente',
        user: req.user
    });
}
router.post("/logout", (req, res) => {
    res.clearCookie("cookieToken");
    res.setHeader('Content-Type','application/json');
    return res.status(200).json({ message: "Sesión cerrada exitosamente" });
});

export default router; 