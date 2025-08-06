import UserRepository from '../repositories/UserRepository.js';
import UserDTO from '../DTO/UserDTO.js';
import {config} from "../config/config.js"
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
        res.cookie(config.jwt_cookie_name, token, { httpOnly: true }).status(200).json({ status: 'success', message: `Usuario logueado con éxito`});
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
