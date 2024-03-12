const Sequelize = require('sequelize');
const bcrypt = require("bcrypt");

// Создаем экземпляр sequelize с указанием пути к файлу базы данных SQLite
const sequelize = new Sequelize('sqlite:my_database.db');

const RoomModel = sequelize.define('Room', {
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

const UserModel = sequelize.define('User', {
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
        set(value) { // добавляем атрибут set для поля password
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


// Синхронизируем экземпляр sequelize с базой данных
sequelize.sync().then(() => {
    console.log('Database created');
});
