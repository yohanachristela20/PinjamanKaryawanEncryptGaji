import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Ambil token dari header Authorization

  if (!token) {

    return res.status(401).json({ message: "Token tidak ditemukan, harap login terlebih dahulu." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid, harap login kembali." });
  }
};

export default verifyToken;