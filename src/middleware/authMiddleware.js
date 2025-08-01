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