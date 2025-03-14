import jwt from "jsonwebtoken";

const activeUsers = {};

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

const checkSessionTimeout = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ redirect: '/login', message: 'Token tidak ditemukan, silakan login ulang.' });
    }

    const jwtSecret = process.env.JWT_SECRET_KEY;

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded?.id_user;

        const currentTime = Date.now();
        const userSession = activeUsers[userId];

        if (userSession) {
            const { lastActivity, heartbeatCount } = userSession;

            // Jika sudah tidak aktif lebih dari 5 menit atau heartbeatCount > 3
            // 300000 = 60000*5
            if (heartbeatCount === null || heartbeatCount > 1 || (currentTime - lastActivity) > 300000) {
                clearUserSession(userId);
                console.log(`Sesi pengguna ${userId} berakhir.`);
                // return res.status(401).json({ redirect: '/login', message: 'Sesi Anda telah berakhir. Silakan login kembali.' });
                return res.status(401).json({ redirect: '/login'});
            }

            activeUsers[userId].lastActivity = currentTime;

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
        console.log(`Sesi pengguna ${userId} telah dihapus.`);
    }
};

export default checkSessionTimeout;
