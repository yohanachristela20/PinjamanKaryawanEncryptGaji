import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import mysql from "mysql2";

dotenv.config();

// const db = new Sequelize("pinjaman_karyawan_encrypt", "root", "", {
//     host: "10.70.10.157", 
//     dialect: 'mysql',
//     timezone: "+07:00", //Indonesian timezone
//     dialectOptions: {
//         timezone: "local", 
//     },
//     logging: false,
// });

const db = new Sequelize(process.env.DB_DBNAME, process.env.DB_USERNAME, process.env.DB_PASSWORD,{
    host: process.env.DB_HOST, 
    dialect: 'mysql',
    port: process.env.DB_PORT,
    timezone: "+07:00", //Indonesian timezone 
    dialectOptions: {
        timezone: "local", 
    },
    logging: false,
    pool: { //buat ngatasin tiba-tiba error, tapi user limit: 5 (sesuai clever cloud-db)
        max: 5,
        min: 0,
        acquire: 120000,
        idle: 60000
    }
});

try {
    await db.authenticate();
    console.log("Database connection succesfully!");
    console.log(process.env.DB_HOST, process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DBNAME, process.env.DB_PORT);
} catch (error) {
    console.error("Database connection failed: ", error);
}

export default db; 