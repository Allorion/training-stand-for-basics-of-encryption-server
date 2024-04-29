import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import {sequelizeDataBase} from "./src/database/scripts/sequelizeDataBase";
import {Server} from 'socket.io';
import http from 'http';
import {socketServer} from "./src/socketServer";

const app = express();

const server = http.createServer(app);

// Инициализация Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

socketServer(io)

app.use(cors())

// Middleware для обработки JSON-запросов
app.use(bodyParser.json());

// Подключение маршрутов API
app.use('/api/room', require('./src/rooms/apiRoom'));
app.use('/api/user', require('./src/users/apiUser'));

const port = 8080;
app.listen(port, '192.168.0.100', () => {
    // sequelizeDataBase()
    console.log(`Сервер запущен на порту ${port}`);
});
// Запускаем сервер
server.listen(8999, '192.168.0.100', () => console.log('Сервер sockets запущен на порту 8999'));

