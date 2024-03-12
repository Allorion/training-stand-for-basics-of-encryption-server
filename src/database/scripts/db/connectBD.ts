import {Sequelize} from "sequelize";

export const sequelizeConnect: Sequelize = new Sequelize('sqlite:src/database/scripts/db/my_database.db');