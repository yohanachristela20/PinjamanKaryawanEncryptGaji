// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// // import cron from "node-cron";
// import KaryawanRoute from "./routes/KaryawanRoute.js"
// import PlafondRoute from "./routes/PlafondRoute.js"
// import PinjamanRoute from "./routes/PinjamanRoute.js"
// import AntreanPengajuan from "./routes/AntreanPengajuanRoute.js";
// import AngsuranRoute from "./routes/AngsuranRoute.js"; 
// // import updateAngsuranOtomatis from './routes/UpdateAngsuranOtomatis.js';

// import UserRoute from "./routes/UserRoutes.js";
// import verifyToken from "./middlewares/authMiddleware.js";
// import checkSessionTimeout from "./middlewares/checkSessionTimeout.js";
// import dotenv from 'dotenv';
// import "./cronjobs.js";

// import './models/PinjamanModel.js';
// import './models/KaryawanModel.js';
// import './models/AntreanPengajuanModel.js';
// import './models/Association.js';
// import './models/AngsuranModel.js';
// import './models/PlafondModel.js'; 
// import './models/UserModel.js';
// import jwt from 'jsonwebtoken';

// dotenv.config();
// const app = express();


// app.use(cors({
//     origin: "http://10.70.10.157:3000",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//     preflightContinue: true,
//     optionsSuccessStatus: 204
// }));

// // app.options('*', cors());

// app.options("*", (req, res) => {
//     console.log("OPTIONS request received for:", req.path);
//     res.header("Access-Control-Allow-Origin", "http://10.70.10.157:3000");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.sendStatus(204);
// });

// app.use((req, res, next) => {
//     console.log(`[${req.method}] ${req.path}`);
//     console.log("Headers:", req.headers);
//     next();
// });





// // app.options('*', (req, res) => {
// //     res.header("Access-Control-Allow-Origin", "http://10.70.10.157:3000");
// //     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
// //     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
// //     // res.header("Access-Control-Allow-Credentials", "true");
// //     res.sendStatus(200);
// // });


// // app.use((req, res, next) => {
// //     res.header("Access-Control-Allow-Origin", allowedOrigin);
// //     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
// //     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
// //     res.header("Access-Control-Allow-Credentials", "true");
// //     res.sendStatus(200);
// //     next();
// // });

// // app.use((req, res, next) => {
// //     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
// //     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
// //     next();
// // });

// app.use(bodyParser.json());
// app.use(express.json());

// app.use(UserRoute); // Rute user untuk login, tanpa middleware otentikasi

// app.get("/pinjaman", (req, res) => {
//     console.log("GET request received for /pinjaman");
//     res.json({ message: "GET request successful" });
// });

// const protectedRoutes = [
//     KaryawanRoute,
//     PlafondRoute,
//     PinjamanRoute,
//     AntreanPengajuan,
//     AngsuranRoute,
//     // PlafondUpdateRoute,
//     // updateAngsuranOtomatis
// ];

// // Terapkan middleware otentikasi pada routes yang dilindungi
// protectedRoutes.forEach(route => {
//     // app.use(verifyToken, checkSessionTimeout, route); 
//     app.use(route);
// });

// process.env.NODE_ENV = 'production';
// console.log("Running in", process.env.NODE_ENV, "mode");

// app.listen(5000, () => console.log('Server up and running in port 5000'));






import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
// import cron from "node-cron";
import KaryawanRoute from "./routes/KaryawanRoute.js"
import PlafondRoute from "./routes/PlafondRoute.js"
import PinjamanRoute from "./routes/PinjamanRoute.js"
import AntreanPengajuan from "./routes/AntreanPengajuanRoute.js";
import AngsuranRoute from "./routes/AngsuranRoute.js"; 
// import updateAngsuranOtomatis from './routes/UpdateAngsuranOtomatis.js';

import UserRoute from "./routes/UserRoutes.js";
import verifyToken from "./middlewares/authMiddleware.js";
import checkSessionTimeout from "./middlewares/checkSessionTimeout.js";
import dotenv from 'dotenv';
import "./cronjobs.js";

import './models/PinjamanModel.js';
import './models/KaryawanModel.js';
import './models/AntreanPengajuanModel.js';
import './models/Association.js';
import './models/AngsuranModel.js';
import './models/PlafondModel.js'; 
import './models/UserModel.js';
import jwt from 'jsonwebtoken';
 
const app = express();

dotenv.config();

app.use(bodyParser.json());
app.use(cors({origin: "http://10.70.10.157:3000"}));
app.use(express.json());

app.use(UserRoute); // Rute user untuk login, tanpa middleware otentikasi

const protectedRoutes = [
    KaryawanRoute,
    PlafondRoute,
    PinjamanRoute,
    AntreanPengajuan,
    AngsuranRoute,
    // PlafondUpdateRoute,
    // updateAngsuranOtomatis
];

// Terapkan middleware otentikasi pada routes yang dilindungi
protectedRoutes.forEach(route => {
    app.use(verifyToken, checkSessionTimeout, route); 
});

app.listen(5000, () => console.log('Server up and running on port 5000'));

