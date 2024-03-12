// Функция для аутентификации пользователя
import {UserModel, UserModelTypes} from "../database/models/UserModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {TokenUserModel} from "../database/models/TokenUserModel";
import {SECRET_KEY, TOKEN_EXPIRY} from "./optionToken";

export interface IResultAuth {
    error: string | null,
    user: {
        id: number,
        name: string,
        group: string,
        role: string,
        token: string
    } | null
}

export const authenticateUser = async (name: string, password: string): Promise<IResultAuth> => {

    const result: IResultAuth = {error: null, user: null}

    try {
        // Ищем пользователя по имени с помощью метода findOne из модели User
        const user: UserModelTypes | null = await UserModel.findOne({
            where: {
                name: name
            }
        });
        // Если пользователь найден
        if (user) {
            // Сравниваем пароли с помощью функции compareSync из библиотеки bcrypt
            const match: boolean = bcrypt.compareSync(password, user.password);
            // Если пароли совпадают, возвращаем пользователя
            if (match) {

                // Находим старый токен по идентификатору пользователя с помощью метода findOne
                const oldToken = await TokenUserModel.findOne({
                    where: {
                        userId: user.id
                    }
                });

                // Если старый токен найден, удаляем его с помощью метода destroy
                if (oldToken) {
                    await oldToken.destroy();
                }


                // Создаем токен с помощью функции sign
                const token: string = jwt.sign({
                    id: user.id, // идентификатор пользователя
                    name: user.name, // имя пользователя
                    group: user.group // группа пользователя
                }, SECRET_KEY, {
                    expiresIn: TOKEN_EXPIRY // время жизни токена
                });

                // Записываем токен в базу данных, связав его с пользователем
                await TokenUserModel.create({
                    token: token,
                    userId: user.id
                })
                    .then(() => {
                        result.user = {
                            id: user.id,
                            name: user.name,
                            group: user.group,
                            role: user.role,
                            token
                        }
                        result.error = null
                    })
                    .catch((err) => {
                        result.user = null
                        result.error = 'Ошибка записи токена'
                    })
            }
        } else {
            result.user = null
            result.error = 'Пользователь не найден'
        }
    } catch (error) {
        // Обрабатываем ошибки, например, если база данных недоступна
        result.user = null
        result.error = 'Ошибка сервера'
    }

    return result
}