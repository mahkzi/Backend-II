import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";

import bcrypt from "bcrypt";
import { UsersManager } from "../dao/usersDBManager.js"; 
import { config } from "./config.js";

const buscarToken = req => {
    let token = null;
    if (req.cookies.cookieToken) token = req.cookies.cookieToken;
    return token;
};

export const iniciarPassport = () =>{
  
    passport.use("current",
    new passportJWT.Strategy(
        {
            secretOrKey:config.JWT_SECRET,
            jwtFromRequest:passportJWT.ExtractJwt.fromExtractors([buscarToken]),
        },
        async (usuario, done) => {
            try {
                const user = await UsersManager.getUserByEmail(usuario.email);
                if(!user){
                    return done(null, false,{message:"usuario no encontrado o token inválido"})
                }
              const userObject = user.toObject();
                delete userObject.password;
                return done(null, userObject);
            } catch (error) {
                return done(error);
            }
        }
    )
    );
     passport.use("login",
        new local.Strategy(
            {
                usernameField: "email",
            },
            async (email, password, done) => {
                try {
                  
                    const user = await UsersManager.getUserByEmail(email);
                    if (!user) {
                        return done(null, false, { message: "Credenciales inválidas" });
                    }

                   
                    const isPasswordValid = bcrypt.compareSync(password, user.password);
                    if (!isPasswordValid) {
                        return done(null, false, { message: "Credenciales inválidas" });
                    }
                     const userObject = user.toObject();
                    delete userObject.password;

                    return done(null, userObject); 
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use("register",
        new local.Strategy(
            {
                usernameField:"email",
                passReqToCallback:true
            },
            async (req, email, password, done) => {
                try {
                    const { first_name, last_name, age } = req.body;
                    if(!first_name || !last_name || !email || !age || !password){
                        return done(null, false, {mesagge : `El usuario con email ${email} ya existe.` })
                    }
                    const newUser ={
                        first_name,
                        last_name,
                        email,
                        age,
                        password,
                        role: "user"
                    };


                    const userCreated = await UsersManager.createUser(newUser);

                      const userObject = userCreated.toObject();
                    delete userObject.password;
                    delete userObject.createdAt;
                    delete userObject.updatedAt;

                    return done(null, userObject);

                } catch (error) {
                     console.error("Error en la estrategia de registro:", error);
                     if (error.code === 11000) { 
                        return done(null, false, { message: `El email ${error.keyValue.email} ya está registrado.` });
                    }
                    return done(error, false, { message: "Error al intentar registrar el usuario." });
                }
            }
        )
    )
};