import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const generateAuthToken = (user) => {
    console.log('jwt.js: Recibiendo objeto para crear token:', user); 

    const payload = {
        id: user.id, 
        email: user.email,
        role: user.role,
        cart: user.cart
    };

    console.log('jwt.js: Payload final del token:', payload);

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });
    return token;
};