import Sequelize, {Model} from "sequelize";
import {sequelizeConnect} from "../scripts/db/connectBD";

export interface RoomModelTypes extends Sequelize.Model {
    id: number;
    name: string,
    closed: boolean,
    token: string,
    expiresAt: Date
}

// Определяем модель Room
export const RoomModel = sequelizeConnect.define<RoomModelTypes>('Room', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    closed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    token: {
        type: Sequelize.STRING,
        unique: true
    },
    expiresAt: {
        type: Sequelize.DATE,
        defaultValue: () => new Date(Date.now() + 3600000)
    }
});
