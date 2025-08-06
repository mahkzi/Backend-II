import UserRepository from '../repositories/UserRepository.js';
import UserDTO from '../DTO/UserDTO.js';
import { createHash, isValidPassword } from '../utils/passwordUtil.js';
import { sendPasswordResetEmail } from '../utils/emailUtil.js';
import {config} from "../config/config.js"
import crypto from 'crypto';
import { generateAuthToken } from '../utils/jwt.js';

export const registerUser = async (req, res) => {
    res.status(201).json({ status: 'success', message: 'Usuario registrado correctamente', payload: req.user });
};

export const failRegister = async (req, res) => {
    res.status(400).json({ status: 'error', message: 'Error al registrar el usuario.' });
};

export const loginUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).json({ status: 'error', message: 'Credenciales inválidas.' });
        }
        const userPayload = new UserDTO(req.user);
        const token = generateAuthToken(userPayload);
        res.cookie(config.jwt_cookie_name, token, { httpOnly: true }).status(200).json({ status: 'success', payload: userPayload});
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

export const failLogin = async (req, res) => {
    res.status(400).json({ status: 'error', message: 'Error en la autenticación.' });
};

export const logoutUser = async (req, res) => {
    res.clearCookie(config.jwt_cookie_name).status(200).json({ status: 'success', message: 'Sesión cerrada.' });
};

export const getCurrentUser = async (req, res) => {
    res.status(200).json({ status: 'success', payload: req.user });
};

export const getUserCart = async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await UserRepository.getUserById(uid);

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }
        
       
        res.status(200).json({ status: 'success', payload: user.cart });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 'error', message: 'Se requiere un email.' });
    }
    try {
        const user = await UserRepository.getUserByEmail(email);
        if (!user) {
            return res.status(200).json({ status: 'success', message: 'Si el email existe, se ha enviado un enlace de recuperación.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000; 
        await UserRepository.updateUser(user._id, {
            resetPasswordToken: token,
            resetPasswordExpires: expires
        });

        await sendPasswordResetEmail(email, token);
        res.status(200).json({ status: 'success', message: 'Si el email existe, se ha enviado un enlace de recuperación.' });

    } catch (error) {
        res.status(500).json({ status: 'error', message: `Error al solicitar el restablecimiento: ${error.message}` });
    }
};

export const validateResetToken = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ status: 'error', message: 'Token no proporcionado.' });
    }
    try {
        const user = await UserRepository.findUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Token inválido o expirado.' });
        }
        res.status(200).json({ status: 'success', message: 'Token válido. Proceda a restablecer su contraseña.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ status: 'error', message: 'Token y nueva contraseña son requeridos.' });
    }

    try {
        const user = await UserRepository.findUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Token de restablecimiento inválido o expirado.' });
        }

        const isSamePassword = isValidPassword(user, newPassword);
        if (isSamePassword) {
            return res.status(400).json({ status: 'error', message: 'La nueva contraseña no puede ser igual a la anterior.' });
        }

        const hashedNewPassword = createHash(newPassword);
        await UserRepository.updatePassword(user.email, hashedNewPassword);

        res.status(200).json({ status: 'success', message: 'Contraseña restablecida exitosamente.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};