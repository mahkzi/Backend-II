import { Router } from 'express';
import passport from 'passport';
import UserRepository from '../repositories/UserRepository.js'; 
import { sendPasswordResetEmail } from '../utils/emailUtil.js';
import { compareHash, createHash } from '../utils/passwordUtil.js'
import { config } from '../config/config.js'; 
import crypto from 'crypto'; 
import UserDTO from '../DTO/UserDTO.js'; 

const router = Router();
const userRepository = UserRepository;

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), async (req, res) => {
    res.status(201).json({ status: 'success', message: 'Usuario registrado correctamente', payload: req.user });
});

router.get('/failregister', async (req, res) => {
    res.status(400).json({ status: 'error', message: 'Error al registrar el usuario.' });
});

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), async (req, res) => {
    try {
    
        if (!req.user) {
            return res.status(400).json({ status: 'error', message: 'Credenciales inválidas.' });
        }


        const token = req.user.generateAuthToken();
       
      
        res.cookie('coderCookieToken', token, {
            maxAge: 60 * 60 * 1000, 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production' 
        });

        res.status(200).json({ status: 'success', message: 'Sesión iniciada correctamente', user: new UserDTO(req.user) }); 
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error en el login: ' + error.message });
    }
});

router.get('/faillogin', async (req, res) => {
    res.status(400).json({ status: 'error', message: 'Error al iniciar sesión.' });
});

router.get('/logout', async (req, res) => {
    res.clearCookie('coderCookieToken');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente.' });
});


router.get('/current',
    passport.authenticate('current', { session: false }), 
    (req, res) => {
       
        res.status(200).json({ status: 'success', payload: req.user });
    }
);


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 'error', message: 'Se requiere un email.' });
    }
    try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
           
            return res.status(200).json({ status: 'success', message: 'Si el email está registrado, se enviará un enlace de restablecimiento.' });
        }

    
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = Date.now() + 3600000; 

        await userRepository.updateUser(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
        });

       
        const resetLink = `http://localhost:${config.PORT}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(email, resetLink);

        return res.status(200).json({ status: 'success', message: 'Si el email está registrado, se enviará un enlace de restablecimiento.' });

    } catch (error) {
        console.error("Error en forgot-password:", error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al procesar la solicitud.' });
    }
});


router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const user = await userRepository.findUserByResetToken(token); 
        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Token de restablecimiento inválido o expirado.' });
        }
        res.status(200).json({ status: 'success', message: 'Token válido. Proceda a restablecer su contraseña.' });
    } catch (error) {
        console.error("Error en validación de token:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ status: 'error', message: 'Token y nueva contraseña son requeridos.' });
    }

    try {
        const user = await userRepository.findUserByResetToken(token); 
        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Token de restablecimiento inválido o expirado.' });
        }

        const isSamePassword = compareHash(user, newPassword); 
        if (isSamePassword) {
            return res.status(400).json({ status: 'error', message: 'La nueva contraseña no puede ser igual a la anterior.' });
        }

        const hashedNewPassword = createHash(newPassword); 
        await userRepository.updatePassword(user.email, hashedNewPassword); 

        res.status(200).json({ status: 'success', message: 'Contraseña restablecida exitosamente.' });
    } catch (error) {
        console.error("Error en reset-password:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al restablecer la contraseña.' });
    }
});

export default router;