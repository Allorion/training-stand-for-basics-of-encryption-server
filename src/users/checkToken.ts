import {TokenUserModel, TokenUserModelTypes} from "../database/models/TokenUserModel";
import jwt, {VerifyErrors} from "jsonwebtoken";
import {SECRET_KEY} from "./optionToken";
import express from "express";
import {IncomingHttpHeaders} from "http";
import moment from "moment";

// Создаем функцию для проверки токена
export const checkToken = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {

    // Добавляем аннотацию типа для объекта req.headers
    //@ts-ignore
    const headers: IncomingHttpHeaders = req.headers;

    // Получаем значение из объекта headers, используя квадратные скобки и строковый ключ
    const token = headers['x-auth-token'] as string;

    // Если токен есть
    if (token) {

        // Проверяем токен с помощью функции verify
        jwt.verify(token, SECRET_KEY, (err: VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {

            let isExpired = true

            // Создаем новую переменную для декодированного токена
            if (jwt.decode(token) !== null) {

                //@ts-ignore
                const decodedToken = jwt.decode(token)!.exp;

                isExpired = moment().isBefore(moment.unix(decodedToken));

                if (!isExpired) {
                    TokenUserModel.destroy({
                        where: {
                            token: token
                        }
                    })
                }

            }

            // Если токен валиден
            if (!err && isExpired) {
                // Находим токен в базе данных с помощью метода findOne
                TokenUserModel.findOne({
                    where: {
                        token: token
                    }
                })
                    .then((tokenUser: TokenUserModelTypes | null) => {
                        // Если токен найден в базе данных
                        if (tokenUser) {
                            next()
                        } else {
                            // Если токена нет в базе данных, отправляем ошибку с кодом 401 и сообщением "Токен не найден в базе данных"
                            res.status(401).send("Токен не найден в базе данных");
                        }
                    })
                    .catch((error: Error) => {
                        // Если произошла ошибка при поиске токена в базе данных, отправляем ошибку с кодом 500 и сообщением об ошибке
                        res.status(500).send(error.message);
                    });
            } else {
                // Если токен невалиден, отправляем ошибку с кодом 401 и сообщением "Невалидный токен"
                res.status(401).send("Невалидный токен");
            }
        });
    } else {
        // Если токена нет, отправляем ошибку с кодом 400 и сообщением "Токен обязателен"
        res.status(400).send("Токен обязателен");
    }
};