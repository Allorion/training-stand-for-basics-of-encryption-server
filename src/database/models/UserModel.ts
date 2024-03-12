import Sequelize, {Model} from "sequelize";
import {sequelizeConnect} from "../scripts/db/connectBD";
import {RoomModel} from "./RoomModel";
import bcrypt from "bcrypt"; // импортируем библиотеку bcrypt для шифрования пароля

export interface UserModelTypes extends Sequelize.Model {
    id: number;
    name: string;
    group: string;
    role: string;
    password: string;
}

// Определяем модель User
export const UserModel = sequelizeConnect.define<UserModelTypes>('User', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        set(value: string) { // добавляем атрибут set для поля password
            // генерируем хеш-код из пароля с помощью bcrypt
            const hash = bcrypt.hashSync(value, bcrypt.genSaltSync(10));
            // устанавливаем значение для пароля
            this.setDataValue('password', hash);
        }
    },
    group: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

// Создаем связь между моделями Room и User
RoomModel.belongsTo(UserModel, {
    as: 'creator', // указываем псевдоним для связи
    foreignKey: 'creatorId' // указываем имя внешнего ключа
});

// Создаем обратную связь между моделями User и Room
UserModel.hasMany(RoomModel, {
    as: 'rooms', // указываем псевдоним для связи
    foreignKey: 'creatorId' // указываем имя внешнего ключа
});
