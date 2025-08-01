import express from 'express';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { config } from './config/config.js'; 
import { connDB } from './config/db.js';     
import iniciarPassport from './config/passport.config.js'; 

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import usersRouter from './routes/users.router.js';
import viewsRouter from './routes/viewsRouter.js'; 
import websocket from './websocket.js'; 
const app = express();


connDB(config.MONGO_URL, config.DB_NAME);


app.engine('handlebars', handlebars.engine());
app.set('views', './src/views'); 
app.set('view engine', 'handlebars');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(cookieParser());

iniciarPassport(); 
app.use(passport.initialize());



app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', usersRouter);


app.use('/', viewsRouter);


app.use((err, req, res, next) => {
    console.error(err.stack); 
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor.';

    
    if (req.accepts('html')) {
        res.status(statusCode).render('errorPage', { title: 'Error', message: message, style: 'error.css' });
    } else {
        res.status(statusCode).json({ status: 'error', message: message });
    }
});


const PORT = config.PORT;
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});


const io = new Server(httpServer);
websocket(io); 