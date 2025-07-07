import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import { connDB } from './config/db.js';



import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import { config } from './config/config.js';
import {router as usersRouter} from './routes/users.router.js'

const app = express();


//Handlebars Config
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);
app.use("/api/sessions", usersRouter);

const PORT = config.PORT;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

connDB(config.MONGO_URL, config.DB_Name);

const io = new Server(httpServer);

websocket(io);