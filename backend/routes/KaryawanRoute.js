import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Karyawan from "../models/KaryawanModel.js";


import {getKaryawan,
        getKaryawanById, 
        createKaryawan, 
        updateKaryawan, 
        deleteKaryawan
} from "../controllers/KaryawanController.js"; 

const router = express.Router(); 

const uploadDirectory = './uploads/karyawan';

if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, {recursive: true});
}  

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                cb(null, uploadDirectory);
        },
        filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
        }
});

const upload = multer({ storage: storage });

router.get('/karyawan', getKaryawan); 
router.get('/karyawan/:id_karyawan', getKaryawanById);
router.post('/karyawan', createKaryawan);  
router.patch('/karyawan/:id_karyawan', updateKaryawan);
router.delete('/karyawan/:id_karyawan', deleteKaryawan);

router.post('/karyawan/import-csv', upload.single("csvfile"), (req,res) => {
        if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const data_karyawan = [];
        
        if (!fs.existsSync('./uploads/karyawan')) {
                fs.mkdirSync('./uploads/karywan');
        }    
        
        fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          data_karyawan.push({
            id_karyawan: row.id_karyawan,
            nama: row.nama,
            jenis_kelamin: row.jenis_kelamin,
            departemen: row.departemen,
            divisi: row.divisi,
            tanggal_lahir: new Date(row.tanggal_lahir),
            tanggal_masuk: new Date(row.tanggal_masuk),
            gaji_pokok: parseInt(row.gaji_pokok, 10)
            
          });
        })
        .on("end", async () => {
          try {
            if (data_karyawan.length === 0) {
              throw new Error("Tidak ada data untuk diimpor");
            }
        
            await Karyawan.bulkCreate(data_karyawan);
        
            res.status(200).json({
              success: true,
              message: "Data berhasil diimpor ke database",
            });
          } catch (error) {
            console.error("Error importing data:", error);
            res.status(500).json({
              success: false,
              message: "Gagal mengimpor data ke database",
              error: error.message,
            });
          } finally {
            fs.unlinkSync(filePath);
          }
        })
        .on("error", (error) => {
          console.error("Error parsing file:", error);
          res.status(500).json({ success: false, message: "Error parsing file" });
        });
        
        });

export default router;