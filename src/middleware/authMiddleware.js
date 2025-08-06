import passport from "passport";
export const authorize = (roles = []) => {
  
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
      
        if (!req.user) {

            return res.status(401).json({ status: 'error', message: 'No autenticado: Se requiere iniciar sesión.' });
        }

        
        if (roles.length && !roles.includes(req.user.role)) {
           
            return res.status(403).json({ status: 'error', message: 'Prohibido: No tienes los permisos para acceder a este recurso.' });
        }

        
        next();
    };

};

export const authenticateAndRespond = (strategy) => (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'No se encuentra logueado. Inicie sesión para continuar.' });
        }
        req.user = user;
        next();
    })(req, res, next);
};