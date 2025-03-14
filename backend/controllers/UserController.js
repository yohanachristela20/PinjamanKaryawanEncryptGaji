import User from "../models/UserModel.js";
import Karyawan from "../models/KaryawanModel.js";
import bcrypt from "bcrypt";


export const getUser = async(req, res) => {
    try {
        const response = await User.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getUserById = async(req, res) => {
    try {
        const response = await User.findOne({
            where:{
                id_user: req.params.id_user 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createUser = async(req, res) => {
    try {
        console.log(req.body);
        await User.create(req.body);
        res.status(201).json({msg: "Data User baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id_user } = req.params;
        const { password, role } = req.body;

        const user = await User.findOne({ where: { id_user } });

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan." });
        }

        const updatedData = { role };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }

        await User.update(updatedData, { where: { id_user } });

        res.status(200).json({ msg: "Data User berhasil diperbarui" });
    } catch (error) {
        console.error("Error saat memperbarui user:", error.message);
        res.status(500).json({ message: "Gagal memperbarui data user." });
    }
};



export const deleteUser = async(req, res) => {
    try {
        await User.destroy({
            where:{
                id_user: req.params.id_user
            }
        });
        res.status(200).json({msg: "Data User berhasil dihapus"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

  export const getUserDetails = async (req, res) => {
    const { username } = req.params;
  
    try {
      const userData = await User.findOne({
        where: { username },
        include: [
          {
            model: Karyawan,
            as: 'Username',
            attributes: ['id_karyawan', 'nama', 'divisi'],
          },
        ],
      });
  
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const { id_karyawan, nama, divisi } = userData.Username;
  
      res.json({
        id_karyawan,
        nama,
        divisi,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching user details" });
    }
  };

  export const getLastUserId = async (req, res) => {
    try {
        const lastRecord = await User.findOne({
            order: [['id_user', 'DESC']],
        });

        if (lastRecord) {
            return res.status(200).json({ lastId: lastRecord.id_user });
        }
        return res.status(200).json({ lastId: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving last user ID.' });
    }
  }; 

const activeUsers = {};
export const checkUserActivity = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan, silakan login ulang.' });
    }
  
    const jwtSecret = process.env.JWT_SECRET_KEY;
  
    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.id_user;

        // Update aktivitas pengguna
        activeUsers[userId].lastActivity = new Date();
        console.log(`User  ${userId} sedang aktif.`);
        next();
    } catch (error) {
        console.error("Token error:", error.message);
        res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
  };