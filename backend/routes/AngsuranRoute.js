import express from "express"; 
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Angsuran from "../models/AngsuranModel.js";
import Pinjaman from "../models/PinjamanModel.js";
import PlafondUpdate from "../models/PlafondUpdateModel.js";
import AntreanPengajuan from "../models/AntreanPengajuanModel.js";
import { Op, Sequelize } from "sequelize";


import { getAngsuran,
         getAngsuranById,
         createAngsuran, 
         getKaryawanData,
         updateAngsuran
        //  getAngsuranData

} from "../controllers/AngsuranController.js"; 

const router = express.Router(); 

const uploadDirectory = './uploads/angsuran';

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

router.get('/angsuran', getAngsuran); 
router.get('/angsuran/:id_angsuran', getAngsuranById);
router.post('/angsuran', createAngsuran);
router.get('/karyawan-data', getKaryawanData);
router.patch('/angsuran/:id_angsuran', updateAngsuran); 
router.put('/angsuran/:id_angsuran', async (req,res) => {
        try {
              const { id_angsuran } = req.params;
              const updatedData = req.body;
              await Angsuran.update(updatedData, { where: { id_angsuran: id_angsuran } });  
              res.status(200).json({message: 'Angsuran diperbarui'}); 
        } catch (error) {
                res.status(500).json({ message: 'Gagal memperbarui angsuran', error:error.message }); 
        }
}); 



// Total sudah dibayar untuk screening
router.get("/angsuran/total-sudah-dibayar/:id_peminjam", async (req, res) => {
        const { id_peminjam } = req.params; 

        try {
             const totalSudahDibayar = await Angsuran.findAll({
                where: {
                        id_peminjam: id_peminjam
                }, 
                attributes: [
                        "id_peminjam", 
                        [Sequelize.fn("SUM", Sequelize.col("sudah_dibayar")), "total_sudah_dibayar"]
                ], 
                group: ["id_peminjam"]
             });  
             res.json(totalSudahDibayar.length > 0 ? totalSudahDibayar[0] : { total_sudah_dibayar: 0 });  
        } catch (error) {
                console.error(error); 
                res.status(500).send("Internal server error"); 
        }
}); 


//total sudah dibayar untuk card plafond - laporan piutang
router.get("/total-dibayar", async (req, res) => {
        try {
             const totalDibayar = await Angsuran.findAll({
                attributes: [
                [Sequelize.fn("SUM", Sequelize.col("sudah_dibayar")), "total_dibayar"]
                ], 
             });  
             res.json(totalDibayar.length > 0 ? totalDibayar[0] : { total_dibayar: 0 });  
        } catch (error) {
                console.error(error); 
                res.status(500).send("Internal server error"); 
        }
}); 

router.post('/angsuran/import-csv', upload.single("csvfile"), async (req,res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const angsuran_data = [];
    
    fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
        angsuran_data.push({
        id_angsuran: row.id_angsuran,
        tanggal_angsuran: new Date(row.tanggal_angsuran),
        bulan_angsuran: row.bulan_angsuran,
        keterangan: row.keterangan,
        status: row.status,
        sudah_dibayar: parseFloat(row.sudah_dibayar),
        belum_dibayar: parseFloat(row.belum_dibayar),
        sudah_dihitung: true,
        status:  parseFloat(row.belum_dibayar) <=0 ? 'Lunas' : 'Belum Lunas',
        id_peminjam: row.id_peminjam,
        id_pinjaman: row.id_pinjaman,
      });
    })
    .on("end", async () => {
      const transaction = await db.transaction();
      try {
        if (angsuran_data.length === 0) {
          throw new Error("Tidak ada data untuk diimpor");
        }
    
        // Menggunakan model Plafond untuk menyimpan data
        await Angsuran.bulkCreate(angsuran_data, { transaction });

        const totalAngsuran = angsuran_data.reduce(( sum, item ) => sum + item.sudah_dibayar, 0);

        const plafondTerakhir = await PlafondUpdate.findOne({
            include: [
              {
                model: Pinjaman,
                as: "UpdatePinjamanPlafond",
                attributes: ["status_pengajuan", "status_transfer"],
                where: { status_pengajuan: "Diterima", status_transfer: "Selesai" },
              },
            ],
            attributes: ["id_pinjaman", "plafond_saat_ini"],
            order: [["id_pinjaman", "DESC"]],
            raw: true,
            transaction,
          });
  
        if (!plafondTerakhir) {
          console.log("Data plafond terakhir tidak ditemukan.");
          return res.status(404).json({ success: false, message: "Plafond terakhir tidak ditemukan" });
        }

          let plafondBaru = parseFloat(plafondTerakhir.plafond_saat_ini || 0) + totalAngsuran;

          console.log("Plafond baru: ", plafondBaru);

          await PlafondUpdate.update(
            { plafond_saat_ini: plafondBaru },
            { where: { id_pinjaman: plafondTerakhir.id_pinjaman }, transaction }
          );

          const antreans = await AntreanPengajuan.findAll({
            attributes: ['nomor_antrean', 'id_pinjaman'],
            order: [['nomor_antrean', 'ASC']],
            transaction,
          });

          console.log("Antreans: ", antreans);

          if (antreans.length > 0) {
            // Ambil detail pinjaman untuk antrean
            const antreanData = await Pinjaman.findAll({
              where: {
                id_pinjaman: { [Op.in]: antreans.map(antrean => antrean.id_pinjaman) },
              },
              attributes: ['id_pinjaman', 'jumlah_pinjaman'],
              transaction,
            });

            console.log("Antrean data: ", antreanData);
  
            const pinjamanMap = new Map(antreanData.map(item => [item.id_pinjaman, item.jumlah_pinjaman]));

            console.log("Pinjaman Map: ", pinjamanMap);
  
            let plafondSaatIni = plafondBaru;
            console.log("Plafondsaatini = plafondbaru: ", plafondSaatIni);
  
            for (const antrean of antreans) {
              const jumlahPinjamanAntrean = pinjamanMap.get(antrean.id_pinjaman) || 0;
  
              let plafondAkhir = parseFloat((plafondSaatIni - jumlahPinjamanAntrean).toFixed(2));
              console.log("Plafond saat ini: ", plafondAkhir);

              if (plafondSaatIni > 0) {
                let formattedToday = new Date().toISOString().split("T")[0];
                await PlafondUpdate.update(
                  {
                    plafond_saat_ini: plafondAkhir,
                    tanggal_plafond_tersedia: formattedToday,
                  },
                  { where: { id_pinjaman: antrean.id_pinjaman }, transaction }
                );
              }
            }
          }
  
          await transaction.commit();

          await Angsuran.update(
            { sudah_dihitung: true },
            { where: { sudah_dihitung: false } },
        );

        res.status(200).json({
          success: true,
          message: "Data berhasil diimpor ke database",
        });
      } catch (error) {
        await transaction.rollback();
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


router.get('/join-pinjaman', async(req, res) => {
        try {
               const angsuran = await Angsuran.findAll({
                include: [
                {
                model: Pinjaman, 
                as: 'AngsuranPinjaman',
                attributes: ['status_pelunasan'], 
                where: {
                        status_pelunasan: {
                                [Op.eq]: 'Belum Lunas' || ''
                        }
                }
                }, 
                ],
               });
               res.json(angsuran);  
        } catch (error) {
                res.status(500).json({error: error.message});
        }        
})

router.get("/last-angsuran", async (req, res) => {
        try {
          const lastRecord = await Angsuran.findOne({
            order: [["id_angsuran", "DESC"]],
          });
          res.json(lastRecord || {});
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
});

router.put('/status-update', async (req, res) => {
    try {
        const today = new Date();

        if (today.getDate() !== 1) {
            return res.status(400).json({
                message: "Update angsuran otomatis hanya dapat dilakukan pada tanggal 1.",
            });
        }
        const formattedToday = today.toISOString().split("T")[0];

        const lastUpdate = await Angsuran.findOne({
            where: Sequelize.where(
                Sequelize.fn("DATE", Sequelize.col("tanggal_angsuran")),
                formattedToday
            ),
        });

        if (lastUpdate) {
            return res.status(200).json({
                message: "Update angsuran otomatis telah dilakukan hari ini.",
                status: "updated",
                alreadyUpdated: true,
            });
        } else {
            return res.status(200).json({
                message: "Belum ada pembaruan angsuran hari ini.",
                status: "not_updated",
                alreadyUpdated: false,
            });
        }

    } catch (error) {
        console.error("Error fetching update status:", error.message);
        res.status(500).json({ message: "Error checking update status." });
    }
});

router.get('/angsuran-berikutnya', async (req, res) => {
  try {
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

      const angsuranData = await Angsuran.findAll({
          include: [
              {
                  model: Pinjaman,
                  as: 'AngsuranPinjaman',
                  attributes: ['jumlah_angsuran', 'status_pelunasan'],
                  where: {
                      status_pelunasan: {
                          [Op.ne]: 'Lunas',
                      },
                  },
              },
          ],
          where: {
              belum_dibayar: {
                  [Op.gt]: 0,
              },
          },
          order: [["id_pinjaman", "ASC"], ["id_angsuran", "DESC"]],
      });

      if (!angsuranData || angsuranData.length === 0) {
          return res.status(404).json({ message: "Tidak ada data angsuran untuk dihitung." });
      }

      // Ambil data terakhir untuk setiap id_pinjaman
      const result = {};
      angsuranData.forEach((item) => {
          if (!result[item.id_pinjaman]) {
              result[item.id_pinjaman] = item;
          }
      });

      const angsuranDataTerakhir = Object.values(result);

      let totalJumlahAngsuranBulanDepan = 0;

      // Hitung jumlah angsuran untuk bulan berikutnya
      const nextMonthAngsuran = angsuranDataTerakhir.map((item) => {
          if (!item.AngsuranPinjaman) {
              console.error(`Pinjaman data is missing for angsuran ID ${item.id_angsuran}`);
              return null;
          }

          const jumlahAngsuranBulanDepan = item.AngsuranPinjaman.jumlah_angsuran;
          const bulanAngsuran = item.bulan_angsuran;
          const bulanDepan = bulanAngsuran + 1;

          totalJumlahAngsuranBulanDepan += parseFloat(jumlahAngsuranBulanDepan);

          return {
              id_pinjaman: item.id_pinjaman,
              jumlah_angsuran_bulan_depan: parseFloat(jumlahAngsuranBulanDepan),
              bulan_angsuran_baru: bulanDepan,
          };
      }).filter(Boolean);

      res.status(200).json({
          message: "Perhitungan angsuran bulan depan berhasil.",
          data: nextMonthAngsuran,
          total_jumlah_angsuran_bulan_depan: totalJumlahAngsuranBulanDepan,
      });
  } catch (error) {
      console.error("Error calculating next month's angsuran:", error.message, error.stack);
      res.status(500).json({
          message: "Gagal menghitung angsuran bulan depan.",
          error: error.message,
      });
  }
});



export default router; 