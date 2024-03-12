import {sequelizeConnect} from "./db/connectBD";
import {UserModel} from "../models/UserModel";
import {RoomModel} from "../models/RoomModel";
import {TokenUserModel} from "../models/TokenUserModel";

export const sequelizeDataBase = () => {
    // Синхронизируем модели с базой данных
    sequelizeConnect.sync()
        .then(() => {
            console.log('Database synchronized');
            UserModel
            RoomModel
            TokenUserModel
        })
        .catch(error => {
            console.error('Database synchronization failed:', error);
        });
}