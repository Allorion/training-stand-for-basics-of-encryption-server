const Sequelize = require('sequelize');

// Создаем экземпляр sequelize с указанием пути к файлу базы данных SQLite
const sequelize = new Sequelize('sqlite:db/my_database.db');

// Синхронизируем экземпляр sequelize с базой данных
sequelize.sync().then(() => {
    console.log('Database created');
});
