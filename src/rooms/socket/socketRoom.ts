/*

// Импортируем модели Room, User и Message
import {RoomModel} from "../../database/models/RoomModel";
import {UserModel} from "../../database/models/UserModel";
import {MessageModel} from "../../database/models/MessageModel";

// Импортируем express, http и socket.io
import express from 'express';
import http from 'http';
import socketio from 'socket.io';


// Создаем экземпляры приложения, сервера и сокетов
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Создаем миддлвар для проверки аутентификации пользователя
const authMiddleware = (socket: socketio.Socket, next: (err?: Error) => void) => {
    // Получаем сессию пользователя из сокета
    const session = socket.request.session;
    // Проверяем, есть ли пользователь в сессии
    if (session && session.user) {
        // Продолжаем обработку сокета
        next();
    } else {
        // Отправляем ошибку 401 (Unauthorized)
        next(new Error('Вы не авторизованы'));
    }
};

// Обрабатываем подключение сокетов
io.on('connection', (socket: socketio.Socket) => {
    // Применяем миддлвар для проверки аутентификации
    socket.use(authMiddleware);

    // Получаем сессию пользователя из сокета
    const session = socket.request.session;
    // Получаем id и имя пользователя из сессии
    const userId = session.user.id;
    const userName = session.user.name;

    // Обрабатываем присоединение к комнате
    socket.on('joinRoom', async (roomId: number) => {
        try {
            // Ищем комнату по id в базе данных
            const room = await RoomModel.findByPk(roomId, {
                // Включаем информацию о создателе комнаты
                include: {
                    model: UserModel,
                    as: 'creator'
                }
            });
            // Проверяем, что комната существует и не закрыта
            if (room && !room.closed) {
                // Присоединяем сокет к комнате
                socket.join(roomId);
                // Отправляем сообщение о присоединении пользователя к комнате
                io.to(roomId).emit('userJoined', {
                    user: {
                        id: userId,
                        name: userName
                    },
                    room: {
                        id: roomId,
                        name: room.name,
                        creator: room.creator.name
                    }
                });
            } else {
                // Отправляем ошибку 404 (Not Found)
                socket.emit('error', 'Комната не найдена или закрыта');
            }
        } catch (error) {
            // Отправляем ошибку 500 (Internal Server Error)
            socket.emit('error', 'Произошла ошибка при присоединении к комнате');
        }
    });

    // Обрабатываем отправку сообщения
    socket.on('sendMessage', async (data: { roomId: number; text: string }) => {
        try {
            // Получаем id и текст сообщения из данных
            const roomId = data.roomId;
            const text = data.text;
            // Проверяем, что id и текст не пустые
            if (roomId && text) {
                // Создаем новое сообщение в базе данных
                const message = await MessageModel.create({
                    text: text,
                    roomId: roomId,
                    userId: userId
                });
                // Отправляем сообщение в комнату
                io.to(roomId).emit('messageSent', {
                    message: {
                        id: message.id,
                        text: message.text,
                        createdAt: message.createdAt,
                        user: {
                            id: userId,
                            name: userName
                        }
                    }
                });
            } else {
                // Отправляем ошибку 400 (Bad Request)
                socket.emit('error', 'Не указан id или текст сообщения');
            }
        } catch (error) {
            // Отправляем ошибку 500 (Internal Server Error)
            socket.emit('error', 'Произошла ошибка при отправке сообщения');
        }
    });

    // Обрабатываем отключение сокета
    socket.on('disconnect', () => {
        // Отправляем сообщение об отключении пользователя
        io.emit('userLeft', {
            user: {
                id: userId,
                name: userName
            }
        });
    });
});

// Запускаем сервер
server.listen(8999, () => console.log('Сервер запущен на порту 8999'));*/
