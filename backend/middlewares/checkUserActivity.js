export const checkUserActivity = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan, silakan login ulang.' });
    }
  
    const jwtSecret = process.env.JWT_SECRET_KEY;
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      const userId = decoded.id_user;
  
      activeUsers[userId] = new Date();

  
      console.log(`User ${userId} sedang aktif.`);
    next();
    } catch (error) {
      console.error("Token error:", error.message);
      res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
  };