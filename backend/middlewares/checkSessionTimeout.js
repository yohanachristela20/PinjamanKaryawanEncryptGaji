// const checkSessionTimeout = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ redirect: '/login', message: 'Token tidak ditemukan, silakan login ulang.' });
//     }

//     // history.push("/login");

//     const jwtSecret = process.env.JWT_SECRET_KEY;

//     try {
//         const decoded = jwt.verify(token, jwtSecret);
//         const userId = decoded.id_user;

//         const currentTime = Date.now();
//         const userSession = activeUsers[userId];

//         if (userSession) {
//             const { lastActivity, heartbeatCount } = userSession;

//             // Jika sudah tidak aktif lebih dari 3 menit atau heartbeatCount > 3
//             if (heartbeatCount > 1 || (currentTime - lastActivity) > 60000) {
//                 clearInterval(userSession.heartbeatInterval);
//                 delete activeUsers[userId];
//                 console.log(`Sesi pengguna ${userId} berakhir.`);
//                 return res.status(401).json({ redirect: '/login', message: 'Sesi Anda telah berakhir. Silakan login kembali.' });
//             }

//             // Perbarui aktivitas terakhir
//             userSession.lastActivity = currentTime;
//         } else {
//             // Tambahkan sesi pengguna baru
//             activeUsers[userId] = {
//                 lastActivity: currentTime,
//                 heartbeatCount: 0,
//                 heartbeatInterval: setInterval(() => {
//                     if (activeUsers[userId]) {
//                         activeUsers[userId].heartbeatCount++;
//                         console.log(`Heartbeat pengguna ${userId}: ${activeUsers[userId].heartbeatCount}`);
//                     }
//                 }, 60000) // Setiap 1 menit
//             };
//         }
//         next(); 
//     } catch (error) {
//         console.error("Token error: ", error.message);
//         res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
//     }
// };

// Latest Fix
// const checkSessionTimeout = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ redirect: '/login', message: 'Token tidak ditemukan, silakan login ulang.' });
//     }

//     const jwtSecret = process.env.JWT_SECRET_KEY;

//     try {
//         const decoded = jwt.verify(token, jwtSecret);
//         console.log("Decoded: ", decoded);
//         const userId = decoded.id;
//         console.log("User id: ", userId);
//         const userToken = decoded.token;
//         console.log("User token: ", userToken);

//         const currentTime = Date.now();
//         const userSession = activeUsers[userId];

//         if (userSession) {
//             const { lastActivity, heartbeatCount } = userSession;

//             // Jika sudah tidak aktif lebih dari 5 menit atau heartbeatCount > 3
//             // 300000 = 60000*5
//             if (heartbeatCount === null || heartbeatCount > 5 || (currentTime - lastActivity) > 300000) {
//                 clearUserSession(userId);
//                 console.log(`Sesi pengguna ${userId} berakhir.`);
//                 // return res.status(401).json({ redirect: '/login', message: 'Sesi Anda telah berakhir. Silakan login kembali.' });
//                 return res.status(401).json({ redirect: '/login'});
//             }

//             activeUsers[userId].lastActivity = currentTime;

//         } else {
//             activeUsers[userId] = {
//                 lastActivity: currentTime,
//                 heartbeatCount: 0,
//                 heartbeatInterval: setInterval(() => {
//                     if (activeUsers[userId]) {
//                         activeUsers[userId].heartbeatCount++;
//                         console.log(`Heartbeat pengguna ${userId}: ${activeUsers[userId].heartbeatCount}`);
//                     }
//                 }, 60000) // Setiap 1 menit
//             };
//         }
//         next(); 
//     } catch (error) {
//         console.error("Token error: ", error.message);
//         res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
//     }
// };

// export const clearUserSession = (userId) => {
//     if (activeUsers[userId]) {
//         clearInterval(activeUsers[userId].heartbeatInterval);
//         delete activeUsers[userId];
//         console.log(`Sesi pengguna ${userId} telah dihapus.`);
//     }
// };

import jwt from "jsonwebtoken";

const activeUsers = {};
const expiredUsers = new Set();

// const checkSessionTimeout = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     console.log("Token: ", token);

//     if (!token) {
//         return forceLogout(res);
//     }

//     const jwtSecret = process.env.JWT_SECRET_KEY;

//     try {
//         const decoded = jwt.verify(token, jwtSecret);
//         const userId = decoded.id;
//         console.log("User id: ", userId);

//         // Jika user sudah expired sebelumnya, langsung paksa logout
//         // if (expiredUsers.has(userId)) {
//         //     console.log(`Pengguna ${userId} mencoba mengakses dengan token expired.`);
//         //     return forceLogout(res);
//         // }

//         const currentTime = Date.now();
//         const userSession = activeUsers[userId];

//         if (userSession) {
//             const { lastActivity, heartbeatCount, heartbeatInterval } = userSession;

//             // Jika sesi sudah melebihi batas waktu (5 menit) atau heartbeatCount > 5
//             if (heartbeatCount > 5 || (currentTime - lastActivity) > 300000) {
//                 console.log(`Sesi pengguna ${userId} telah berakhir.`);
//                 clearInterval(heartbeatInterval);
//                 delete activeUsers[userId];
//                 expiredUsers.add(userId); // Tandai user sebagai expired
//                 return forceLogout(res);
//             }

//             // Perbarui aktivitas terakhir
//             activeUsers[userId].lastActivity = currentTime;
//         } else {
//             // Jika user belum terdaftar, inisialisasi sesi
//             activeUsers[userId] = {
//                 lastActivity: currentTime,
//                 heartbeatCount: 0,
//                 heartbeatInterval: setInterval(() => {
//                     if (activeUsers[userId]) {
//                         activeUsers[userId].heartbeatCount++;
//                         console.log(`Heartbeat pengguna ${userId}: ${activeUsers[userId].heartbeatCount}`);
//                     }
//                 }, 60000) // Setiap 1 menit
//             };
//         }
//         next();
//     } catch (error) {
//         console.error("Token error: ", error.message);
//         return forceLogout(res);
//     }
// };

// export const clearUserSession = (userId) => {
//     if (activeUsers[userId]) {
//         clearInterval(activeUsers[userId].heartbeatInterval);
//         delete activeUsers[userId];
//         expiredUsers.add(userId);
//         console.log(`Sesi pengguna ${userId} telah dihapus.`);
//     }
// };

// // Fungsi untuk paksa logout dengan header no-cache
// const forceLogout = (res) => {
//     res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
//     return res.status(401).json({
//         redirect: '/login',
//         message: 'Sesi telah berakhir atau token tidak valid. Silakan login kembali.',
//         // clearToken: true,
//     });
// };


const checkSessionTimeout = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    // console.log("Token: ", token); 

    if (!token) {
        return forceLogout(res);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // console.log("Decoded: ", decoded);
        const userId = decoded.id;
        // console.log("User id: ", userId);

        const currentTime = Date.now();
        const userSession = activeUsers[userId];

        
        // if (expiredUsers.has(userId)) {
        //     console.log(`Pengguna ${userId} mencoba mengakses dengan token expired.`);

        //     // Set header untuk mencegah caching halaman sebelumnya
        //     res.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        //     res.header('Pragma', 'no-cache');
        //     res.header('Expires', '0');

        //     // Paksa logout dan arahkan ke /login
        //     return res.status(401).json({
        //         redirect: '/login',
        //         message: 'Sesi telah berakhir. Silakan login kembali.',
        //         clearToken: true,
        //     });
        // }
        
        if (userSession) {
            const { lastActivity, heartbeatCount } = userSession;

            // Jika sudah tidak aktif lebih dari 5 menit atau heartbeatCount > 3
            // 300000 = 60000*5
            if (heartbeatCount > 5 || (currentTime - lastActivity) > 300000) {
                clearInterval(activeUsers[userId].heartbeatInterval);
                delete activeUsers[userId];
                expiredUsers.add(userId);
                console.log(`Sesi pengguna ${userId} telah dihapus.`);
                return res.status(401).json({ redirect: '/login', message: 'Sesi Anda telah berakhir. Silakan login kembali.' });
                // return forceLogout(res);

            }

            // activeUsers[userId].lastActivity = currentTime;
            
        } else {
            activeUsers[userId] = {
                lastActivity: currentTime,
                heartbeatCount: 0,
                heartbeatInterval: setInterval(() => {
                    if (activeUsers[userId]) {
                        activeUsers[userId].heartbeatCount++;
                        console.log(`Heartbeat pengguna ${userId}: ${activeUsers[userId].heartbeatCount}`);
                    }
                }, 60000) // Setiap 1 menit
            };
        }
        next(); 
    } catch (error) {
        console.error("Token error: ", error.message);
        res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
};

export const clearUserSession = (userId) => {
    if (activeUsers[userId]) {
        clearInterval(activeUsers[userId].heartbeatInterval);
        delete activeUsers[userId];
        expiredUsers.add(userId);
        console.log(`Sesi pengguna ${userId} telah dihapus.`);
        if (res) forceLogout(res);
    }
};

// // Fungsi untuk paksa logout dengan header no-cache
const forceLogout = (res) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');    
    return res.status(401).json({
        redirect: '/login',
        message: 'Sesi telah berakhir atau token tidak valid. Silakan login kembali.',
        clearToken: true,
    });
};


export default checkSessionTimeout;


