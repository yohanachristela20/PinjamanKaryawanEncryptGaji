import { Sequelize } from "sequelize";
import db from "../config/database.js";
import CryptoJS from "crypto-js";

const {DataTypes} = Sequelize;
const SECRET_KEY = "K4dnZFBXev";

const Karyawan = db.define('karyawan', {
    id_karyawan: {
        type: DataTypes.INTEGER, 
        primaryKey: true,
    },
    nama: DataTypes.STRING,
    jenis_kelamin: DataTypes.CHAR,
    departemen: DataTypes.STRING,
    divisi: DataTypes.STRING,
    tanggal_lahir: DataTypes.DATEONLY,
    tanggal_masuk: DataTypes.DATEONLY,
    // gaji_pokok: DataTypes.TEXT
    gaji_pokok: {
        type: DataTypes.TEXT, 
        set(value) {
            const encrypted = CryptoJS.AES.encrypt(value.toString(), SECRET_KEY).toString();
            this.setDataValue('gaji_pokok', encrypted);
        },
        get() {
            const encryptedValue = this.getDataValue('gaji_pokok');
            if (!encryptedValue) return null;
            const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
            return parseFloat(bytes.toString(CryptoJS.enc.Utf8));
        }
    }
}, {
    freezeTableName: true 
}); 

export default Karyawan; 

(async()=> {
    await db.sync();
})(); 