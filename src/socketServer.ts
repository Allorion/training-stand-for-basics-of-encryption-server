import {Server} from "socket.io";

export const socketServer = (io: Server) => {
    // Обработка подключения через Socket.IO
    io.on('connection', (socket) => {
        console.log('Пользователь подключен');

        socket.on('sendMessage', (msg) => {
            io.emit('sendMessage', msg);
        });

        socket.on('disconnect', () => {
            console.log('Пользователь отключен');
        });
    });

}