import express from "express";
import {UserModel} from "../database/models/UserModel";
import {authenticateUser, IResultAuth} from "./authenticateUser";
import {checkToken} from "./checkToken";
import {IncomingHttpHeaders} from "http";
import {TokenUserModel, TokenUserModelTypes} from "../database/models/TokenUserModel";

const router = express.Router()


router.post('/register', async (req, res) => {

    const reqData: {
        name: string,
        password: string,
        group: string,
        role: string
    } = req.body

    // Создаем пользователя с помощью метода create
    UserModel.create(reqData)
        .then(result => {
            // Отправляем ответ с кодом 200 и сообщением "Пользователь создан"
            res.status(200).send(`Пользователь ${reqData.name} создан`);
        })
        .catch(err => {
            // Если произошла ошибка из-за нарушения ограничения уникальности, отправляем ошибку с кодом 409 и сообщением "Пользователь с таким именем уже существует"
            if (err.name === 'SequelizeUniqueConstraintError') {
                res.status(409).send(`Пользователь с именем ${reqData.name} уже существует`);
            } else {
                // Отправляем ответ с кодом 500 и сообщением об ошибке
                res.status(500).send(err.message);
            }
        });

})

router.post('/auth', async (req, res) => {

    const reqBody: { name: string, password: string } = req.body

    const result: IResultAuth = await authenticateUser(reqBody.name, reqBody.password)

    if (result.user === null) {
        res.status(500).json(result)
    } else {
        res.status(200).json(result)
    }

})

router.post('/refresh', checkToken, async (req, res) => {
    // Добавляем аннотацию типа для объекта req.headers
    //@ts-ignore
    const headers: IncomingHttpHeaders = req.headers;

    // Получаем значение из объекта headers, используя квадратные скобки и строковый ключ
    const token = headers['x-auth-token'] as string;

    // Находим токен в базе данных с помощью метода findOne
    TokenUserModel.findOne({
        where: {
            token: token
        }
    })
        .then((tokenUser: TokenUserModelTypes | null) => {
            // Если токен найден в базе данных
            if (tokenUser) {
                UserModel.findOne({
                    where: {
                        id: tokenUser.userId
                    }
                })
                    .then((userInfo) => {
                        res.status(200).send({ user: {
                                "id": userInfo?.id,
                                "name": userInfo?.name,
                                "group": userInfo?.group,
                                "role": userInfo?.role
                            }});
                    })
                    .catch((error: Error) => {
                        // Если произошла ошибка при поиске токена в базе данных, отправляем ошибку с кодом 500 и сообщением об ошибке
                        res.status(500).send(error.message);
                    });
            }
        })
        .catch((error: Error) => {
            // Если произошла ошибка при поиске токена в базе данных, отправляем ошибку с кодом 500 и сообщением об ошибке
            res.status(500).send(error.message);
        });
})


export = router