import express from "express";
import {RoomModel, RoomModelTypes} from "../database/models/RoomModel";
import {checkToken} from "../users/checkToken";
import {TokenUserModel} from "../database/models/TokenUserModel";

// Создаем тип для данных, получаемых при GET запросе подключения к комнате
interface IJoinQueryData {
    token: string;
}

const router = express.Router()

// Создаем роут для получения списка открытых комнат
router.get("/list-rooms", checkToken, (req: express.Request, res: express.Response) => {
    // Используем метод findAll модели Room
    RoomModel.findAll({
        // Указываем условие для фильтрации по полю closed
        where: {
            closed: false
        }
    })
        .then((rooms: RoomModelTypes[]) => {
            // Если поиск успешен, отправляем результат в виде JSON ответа
            res.status(200).json(rooms);
        })
        .catch((error: Error) => {
            // Если произошла ошибка, отправляем ошибку с кодом 500 и сообщением об ошибке
            res.status(500).send(error.message);
        });
});


// определяем роут для создания комнаты
router.post('/add', checkToken, async (req: express.Request, res: express.Response) => {
    try {

        // получаем данные из тела запроса
        const data = req.body;
        const {name, token, closed} = req.body;

        // Добавляем аннотацию типа для объекта req.headers
        //@ts-ignore
        const headers: IncomingHttpHeaders = req.headers;

        const userToken = headers['x-auth-token'] as string;

        // проверяем, что все поля были переданы
        if (!name || !token) {
            // если нет, возвращаем ошибку
            return res.status(400).json({error: 'Недостаточно данных'});
        }

        // находим пользователя по токену
        const user = await TokenUserModel.findOne({
            where: {token: userToken} // ищем по токену
        });

        // проверяем, что пользователь существует
        if (!user) {
            // если нет, возвращаем ошибку
            return res.status(404).json({error: 'Пользователь не найден'});
        }

        // создаем новую запись в базе данных
        await RoomModel.create({
            name,
            closed,
            token,
            creatorId: user.userId, // передаем идентификатор пользователя
        })
            .then((room: RoomModelTypes) => {
                // возвращаем успешный ответ с данными комнаты
                return res.status(201).json({error: null, room});
            })
            .catch((error: Error) => {
                // Если произошла ошибка при создании записи, проверяем ее тип
                if (error.name === "SequelizeUniqueConstraintError") {
                    // Если ошибка дублирования уникального значения, отправляем ответ с кодом 404 и сообщением
                    res.status(404).json({error: 'Такая комната уже существует'});
                } else {
                    // Если другая ошибка, отправляем ответ с кодом 500 и сообщением об ошибке
                    res.status(500).send(error.message);
                }
            });
    } catch (error) {
        // если произошла ошибка, возвращаем ее
        return res.status(500).json({error: 'Ошибка сервера'});
    }
});


// Создаем роут для присоединения к комнате по токену
router.post('/join', checkToken, async (req: express.Request, res: express.Response) => {

    try {
        // Получаем токен комнаты из тела запроса
        const query = req.query as unknown as IJoinQueryData;

        // Проверяем, что токен не пустой
        if (query.token) {
            // Ищем комнату по токену в базе данных
            const room = await RoomModel.findOne({
                where: {
                    token: query.token
                }
            });
            // Проверяем, что комната существует и не закрыта
            if (room) {
                // Отправляем информацию о комнате в формате JSON
                res.status(200).json({
                    "id": room.id,
                    "name": room.name,
                    "closed": room.closed,
                    "token": room.token,
                    "expiresAt": room.expiresAt
                });
            } else {
                // Отправляем ошибку 404 (Not Found)
                res.status(404).send('Комната не найдена');
            }
        } else {
            // Отправляем ошибку 400 (Bad Request)
            res.status(400).send('Не указан токен комнаты');
        }
    } catch (error) {
        // Отправляем ошибку 500 (Internal Server Error)
        res.status(500).send('Произошла ошибка при присоединении к комнате');
    }
});

export = router