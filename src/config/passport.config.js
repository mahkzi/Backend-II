import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { isValidPassword } from '../utils/passwordUtil.js'
import { config } from './config.js' 
import UserRepository from '../repositories/UserRepository.js'
import UserDTO from '../DTO/UserDTO.js'; 

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const iniciarPassport = () => {
    
    passport.use("login",
        new local.Strategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const user = await UserRepository.getUserByEmail(email); 
                    if (!user) {
                        return done(null, false, { message: `Usuario con email ${email} no encontrado.` });
                    }
                    if (!isValidPassword(user, password)) { 
                        return done(null, false, { message: "Contraseña incorrecta." });
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    
    passport.use("register",
        new local.Strategy(
            { passReqToCallback: true, usernameField: "email" },
            async (req, email, password, done) => {
                try {
                    const { first_name, last_name, age, role = 'user' } = req.body; 
                    if (!first_name || !last_name || !email || !age || !password) {
                        return done(null, false, { message: `Todos los campos son obligatorios.` });
                    }
                    const existingUser = await UserRepository.getUserByEmail(email); 
                    if (existingUser) {
                        return done(null, false, { message: `El email ${email} ya está registrado.` });
                    }

                    const newUser = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password, 
                        role
                    };
                    const userCreated = await UserRepository.createUser(newUser);
                    return done(null, userCreated);
                } catch (error) {
                    console.error("Error en la estrategia de registro:", error);
                    return done(error, false, { message: "Error al intentar registrar el usuario." });
                }
            }
        )
    );

    passport.use("current",
        new JWTStrategy(
            {
                secretOrKey: config.JWT_SECRET,
                jwtFromRequest: ExtractJWT.fromExtractors([req => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['coderCookieToken']; 
                    }
                    return token;
                }]),
            },
            async (jwt_payload, done) => {
                try {
                    const user = await UserRepository.getUserById(jwt_payload.id); 
                    if (!user) {
                        return done(null, false, { message: "Usuario no encontrado o token inválido" });
                    }
                    
                    return done(null, new UserDTO(user));
                } catch (error) {
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
            const user = await UserRepository.getUserById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default iniciarPassport;