import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Karyawan from "./KaryawanModel.js";
import bcrypt from "bcrypt";

const {DataTypes} = Sequelize;

const User = db.define('user', {
    id_user: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    username: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Karyawan, 
            key: 'id_karyawan' 
        }
    }, 
    password: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (user, options) => {
            const lastRecord = await User.findOne({
                order: [['id_user', 'DESC']]
            }); 
            let newId = "USC0001"; //default id

            if (lastRecord && lastRecord.id_user) {
                const lastIdNumber = parseInt(lastRecord.id_user.substring(3), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(4, '0');
                newId = `USC${incrementedIdNumber}`;
            }
            user.id_user = newId;
        },
        beforeCreate: async (user, options) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10); //salt: data acak untuk hashing/ enkripsi pass
                user.password = await bcrypt.hash(user.password, salt); 
            }
        },
    }, 
});  

export default User; 

(async()=> {
    await db.sync();
})(); 