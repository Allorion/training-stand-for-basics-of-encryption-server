import Sequelize, {Model} from "sequelize";
import {sequelizeConnect} from "../scripts/db/connectBD";
import {UserModel} from "./UserModel";

export interface TokenUserModelTypes extends Sequelize.Model {
    token: string;
    userId: number;
}

// Создаем модель Token
export const TokenUserModel = sequelizeConnect.define<TokenUserModelTypes>('Token', {
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

// Создаем связь между моделями User и Token
UserModel.hasMany(TokenUserModel, {
    foreignKey: 'userId'
});
TokenUserModel.belongsTo(UserModel, {
    foreignKey: 'userId'
});