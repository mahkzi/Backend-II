import { Router } from 'express';
import passport from 'passport';
import { authorize, authenticateAndRespond } from '../middleware/authMiddleware.js';
import { 
    registerUser, 
    failRegister, 
    loginUser, 
    failLogin, 
    logoutUser, 
    getCurrentUser,
    getUserCart
} from '../controllers/user.controller.js';

const router = Router();


router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister', session: false }), registerUser);
router.get('/failregister', failRegister);
router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin', session: false }), loginUser);
router.get('/faillogin', failLogin);
router.get('/logout', logoutUser);
router.get('/current', authenticateAndRespond('current'), getCurrentUser);
router.get('/:uid/cart', passport.authenticate('current', { session: false }), authorize('user'), getUserCart);

export default router;