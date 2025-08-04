import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { createHash, isValidPassword } from '../utils/passwordUtil.js';
import { config } from './config.js';
import UserRepository from '../repositories/UserRepository.js';
import UserDTO from '../DTO/UserDTO.js';
import CartDAO from '../dao/CartDAO.js';
import ProductDAO from '../dao/ProductDAO.js';

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const iniciarPassport = () => {

    const userManager = UserRepository;
    const productManager = new ProductDAO();
    const cartManager = new CartDAO(productManager); 

      passport.use(
        'register',
        new local.Strategy(
            {
                passReqToCallback: true,
                usernameField: 'email',
            },
            async (req, username, password, done) => {
                const { first_name, last_name, email, age, role = 'user' } = req.body;
                try {
                    let user = await userManager.getUserByEmail(email);
                    if (user) {
                        return done(null, false);
                    }
                    const newCart = await cartManager.createCart();
                    const newUser = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password,
                        cart: newCart._id,
                        role
                    };
                    console.log('Estrategia de registro: Nuevo usuario a crear:', newUser);
                    let userCreated = await userManager.createUser(newUser);
                    return done(null, userCreated);
                } catch (error) {
                    console.error('Error en la estrategia de registro:', error);
                    return done(error);
                }
            }
        )
    );


      passport.use(
        'login',
        new local.Strategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            },
            async (email, password, done) => {
                try {
                    console.log('---------- Iniciando estrategia de login ----------');
                    console.log('Intentando login para el email:', email);

                    const user = await userManager.getUserByEmail(email);

                    if (!user) {
                        console.log('Usuario NO encontrado en la base de datos.');
                        return done(null, false, { message: 'Usuario no encontrado.' });
                    }

                    console.log('Usuario encontrado:', user.email);
                    console.log('Comparando contraseñas...');

                    if (!isValidPassword(user, password)) {
                        console.log('Contraseña INVÁLIDA.');
                        return done(null, false, { message: 'Contraseña incorrecta.' });
                    }

                    console.log('Contraseña VÁLIDA. Login exitoso.');
                    return done(null, user);

                } catch (error) {
                    console.log('Error en la estrategia de login:', error);
                    return done(error);
                }
            }
        )
    );

  
    passport.use(
    'current',
    new JWTStrategy(
        {
            secretOrKey: config.JWT_SECRET,
            jwtFromRequest: ExtractJWT.fromExtractors([req => {
                let token = null;
                if (req && req.cookies) {
                    token = req.cookies['coderCookieToken'];
                    console.log('Passport-JWT: Token encontrado en la cookie:', token); 
                }
                if (!token) {
                    console.log('Passport-JWT: No se encontró el token en la cookie.'); 
                }
                return token;
            }]),
        },
        async (jwt_payload, done) => {
            console.log('Passport-JWT: Payload recibido:', jwt_payload); 
            try {
                const user = await userManager.getUserById(jwt_payload.id);
                if (!user) {
                    console.log('Passport-JWT: Usuario no encontrado en la DB.'); 
                    return done(null, false, { message: 'Usuario no encontrado o token inválido' });
                }
                console.log('Passport-JWT: Usuario autenticado con éxito:', user.email); 
                return done(null, new UserDTO(user));
            } catch (error) {
                console.log('Passport-JWT: Error en la verificación del token:', error);
                return done(error);
            }
        }
    )
);


    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userManager.getUserById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default iniciarPassport;