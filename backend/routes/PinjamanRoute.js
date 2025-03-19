import express from "express"; 
import { createPinjaman,
         getPinjaman,
         getPinjamanById,
         getPinjamanData,
         getDataPinjaman,
         filterPiutangTahunan,
         getDataPerDivisi,
 } from "../controllers/PinjamanController.js";    
import Plafond from "../models/PlafondModel.js";
import Angsuran from "../models/AngsuranModel.js";
import Karyawan from "../models/KaryawanModel.js";
import PlafondUpdate from "../models/PlafondUpdateModel.js";
import { Op, Sequelize, where } from "sequelize";

import multer from 'multer'; // Import multer for file upload handling
import path, { parse } from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Pinjaman from "../models/PinjamanModel.js";
import AntreanPengajuan from "../models/AntreanPengajuanModel.js";

const router = express.Router();

const uploadDirectory = './uploads/antrean';

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


router.get('/pinjaman', getPinjaman);
router.get('/pinjaman/:id_pinjaman', getPinjamanById); 
router.post('/pinjaman', createPinjaman);  
router.get('/pinjaman-data', getPinjamanData);
router.get('/data-pinjaman', getDataPinjaman);
router.get('/filter-piutang', filterPiutangTahunan);
router.get('/data-divisi', getDataPerDivisi); 

router.get("/total-pinjaman-keseluruhan", async (req, res) => {
        try {
          const totalPinjamanKeseluruhan = (await Pinjaman.sum("jumlah_pinjaman", {
            where: {
              status_pengajuan: "Diterima",
              status_transfer: "Selesai",
            },
          })) || 0;
      
          // console.log("Total Pinjaman Keseluruhan:", totalPinjamanKeseluruhan);
      
          res.status(200).json({ totalPinjamanKeseluruhan });
        } catch (error) {
          console.error("Error fetching total pinjaman:", error.message);
          res.status(500).json({ message: "Internal server error" });
        }
      });


      

router.get("/total-peminjam", async (req, res) => {
        try {
            const totalPeminjam = await Pinjaman.count({
                distinct: true,
                col: 'id_peminjam',
                where: {
                        status_pengajuan: "Diterima",
                        status_transfer: "Selesai"
                }

            }); 
            console.log("Total peminjam: ", totalPeminjam); 
            
            if (totalPeminjam === null || totalPeminjam === undefined) {
                return res.status(404).json({ message: "No peminjam data found" });
            } 

            const total_peminjam = totalPeminjam || 0;
            console.log("Total Peminjam: ", total_peminjam); 

            res.status(200).json({ totalPeminjam: total_peminjam});
        } catch (error) {
                console.error("Error fetching total peminjam:", error.message);
                res.status(500).json({ message: "Internal server error" });
        }
})
      
router.get("/pinjaman/total-pinjaman/:id_peminjam", async (req, res) => {
  const { id_peminjam } = req.params; 

  try {
       const totalPinjaman = await Pinjaman.findAll({
          where: {
                  id_peminjam: id_peminjam,
                  status_pengajuan: "Diterima",
                  status_transfer: "Selesai"
          }, 
          attributes: [
                  "id_peminjam", 
                  [Sequelize.fn("SUM", Sequelize.col("pinjaman_setelah_pembulatan")), "total_pinjaman"]
          ], 
          group: ["id_peminjam"]
       });  
       res.json(totalPinjaman.length > 0 ? totalPinjaman[0] : { total_pinjaman: 0 });  
  } catch (error) {
          console.error(error); 
          res.status(500).send("Internal server error"); 
  }
}); 

router.get("/plafond-tersedia", async (req, res) => {
        try {
          const totalPinjamanKeseluruhan = (await Pinjaman.sum("jumlah_pinjaman", {
            where: {
              status_pengajuan: "Diterima",
              status_transfer: "Selesai",
            },
          })) || 0;
      
          const totalSudahDibayar = (await Angsuran.sum("sudah_dibayar")) || 0;
         
          const plafond = await Plafond.findOne({
            order: [["id_plafond", "DESC"]],
          });
      
          if (!plafond) {
            return res.status(404).json({ message: "No plafond data found" });
          }
      
          const plafondTersedia =
            parseFloat(plafond.jumlah_plafond - totalPinjamanKeseluruhan + totalSudahDibayar) || 0;
      
      
          res.status(200).json({ plafondTersedia });
        } catch (error) {
          console.error("Error fetching plafond tersedia:", error.message);
          res.status(500).json({ message: "Internal server error" });
        }
});


router.get("/plafond-tersisa", async (req, res) => {
  try {
    const plafond = await PlafondUpdate.findOne({
      order: [["id_plafondupdate", "DESC"]],
    });

    if (!plafond) {
      return res.status(404).json({ message: "No plafond data found" });
    }

    const plafondTersedia =
      parseFloat(plafond.plafond_saat_ini);


    res.status(200).json({ plafondTersedia });
  } catch (error) {
    console.error("Error fetching plafond tersedia:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Untuk Dashboard User
router.get("/plafond-saat-ini", async (req, res) => {
  try {
    const storedJumlahPinjaman = parseFloat(
      (req.query.jumlah_pinjaman).replace(/[,\\.]/g, "")
    );

    const plafondUpdate = await PlafondUpdate.findOne({
      include: [
        {
          model: Pinjaman,
          as: "UpdatePinjamanPlafond",
          attributes: ["status_pengajuan", "status_transfer"],
          where: { status_pengajuan: {[Op.ne]: 'Dibatalkan'}, status_transfer: {[Op.ne]: 'Dibatalkan'} },
        }
      ],
      order: [["id_plafondupdate", "DESC"]],
      limit: 1,
    });

    let totalDibayar = 0;
    let statusPinjaman = "Tidak memiliki pinjaman aktif.";
    let pinjamanInfo = "Tidak ada informasi pinjaman.";

    if (plafondUpdate) {
      const updatePlafondPinjaman = parseFloat(plafondUpdate.plafond_saat_ini);

      const latestPlafond = await PlafondUpdate.findOne({
        order: [["id_plafondupdate", "DESC"]],
      });
  
      if (!latestPlafond) {
        return res.status(404).json({ message: "Data plafond tidak ditemukan" });
      }
  
      const angsuranBelumDihitung = await Angsuran.findAll({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("sudah_dibayar")), "total_dibayar"]
        ], 
        raw: true,
      });

      totalDibayar = parseFloat(angsuranBelumDihitung[0]?.total_dibayar || 0);

      const plafondSaatIni =
        updatePlafondPinjaman - storedJumlahPinjaman;

        if (plafondSaatIni < storedJumlahPinjaman) {
          statusPinjaman = "Memiliki Pinjaman Aktif";
          pinjamanInfo = "Pinjaman dapat diajukan setelah beberapa bulan.";
        }

      return res.status(200).json({
        updatePlafondPinjaman,
        totalDibayar,
        plafondSaatIni,
        plafond: updatePlafondPinjaman,
      });
    }

    const latestPlafond = await PlafondUpdate.findOne({
      order: [["id_plafondupdate", "DESC"]],
    });

    if (!latestPlafond) {
      return res.status(404).json({ message: "Data plafond tidak ditemukan" });
    }

    const plafondAwal = parseFloat(latestPlafond.plafond_saat_ini);
    console.log("Plafond awal: ", plafondAwal);
    console.log("Stored jumlah pinjaman: ", storedJumlahPinjaman);
    const plafondSaatIni = plafondAwal - storedJumlahPinjaman;
    console.log("Plafond saat ini: ", plafondSaatIni);
    
    return res.status(200).json({
      plafondAwal,
      totalDibayar: 0,
      plafondSaatIni,
      plafond: plafondAwal,
    });
  } catch (error) {
    console.error("Error in plafond-saat-ini route:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});


router.get("/plafond-update-saat-ini/:id_pinjaman", async (req, res) => {
  const { id_pinjaman } = req.params;
  try {
    
    const plafondSaatIni = await PlafondUpdate.findOne(
      { where: { id_pinjaman: id_pinjaman },
      attributes: ["plafond_saat_ini"] }
    );

    if (plafondSaatIni) {
      const plafond = parseFloat(plafondSaatIni.plafond_saat_ini);
      console.log("Data plafond saat ini:", plafond);

      return res.status(200).json({
        plafondSaatIni: plafond
      });
    }

    
  } catch (error) {
    console.error("Error in plafond-update-saat-ini route:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/latest-plafond-saat-ini", async (req, res) => {
  try {
    let latestPlafondValue = null;

    // Ambil pinjaman terbaru dengan status_transfer "Selesai"
    const latestPinjaman = await Pinjaman.findOne({
      order: [["id_pinjaman", "DESC"]],
      raw: true,
    });  

    if (latestPinjaman) {
      console.log("Latest Pinjaman:", latestPinjaman.id_pinjaman);

      // Cek status_pengajuan dan status_transfer dari latestPinjaman
      const pinjamanStatus = await Pinjaman.findOne({
        where: { id_pinjaman: latestPinjaman.id_pinjaman },
        attributes: ["status_transfer"],
        raw: true,
      });

      console.log("Status Pinjaman:", pinjamanStatus);

      if (
        pinjamanStatus?.status_transfer !== "Selesai"
      ) {
        console.log("Pinjaman terakhir BELUM ditransfer.");

        // Ambil plafond terbaru dari id_pinjaman = null
        const latestPlafondNull = await PlafondUpdate.findOne({
          attributes: ["plafond_saat_ini"],
          where: { id_pinjaman: null },
          order: [["id_plafondupdate", "DESC"]],
          raw: true,
        });

        latestPlafondValue = latestPlafondNull?.plafond_saat_ini || null;
        console.log("Plafond dari id_pinjaman NULL:", latestPlafondValue);
      } else {
        // Jika pinjaman sudah "Diterima" dan "Selesai", cari plafond dari PlafondUpdate
        const plafondUpdate = await PlafondUpdate.findOne({
          where: { id_pinjaman: latestPinjaman.id_pinjaman },
          attributes: ["plafond_saat_ini"],  
          raw: true,
        });

        latestPlafondValue = plafondUpdate?.plafond_saat_ini || null;
        console.log("Plafond dari PlafondUpdate:", latestPlafondValue);
      }
    }

    // Jika latestPlafondValue masih null, cari plafond terbaru yang sudah diterima dan selesai transfer
    if (latestPlafondValue) {
      const latestPlafond = await PlafondUpdate.findOne({
        include: [
          {
            model: Pinjaman,
            as: "UpdatePinjamanPlafond",
            attributes: ["status_pengajuan", "status_transfer"],
            where: { status_pengajuan: "Diterima", status_transfer: "Selesai" },
            required: true, // Pastikan hanya yang sudah diterima & selesai
          },
        ],
        attributes: ["plafond_saat_ini"],
        order: [["id_pinjaman", "DESC"]],
        raw: true,
      });

      latestPlafondValue = latestPlafond?.plafond_saat_ini || null;
      console.log("Plafond dari pinjaman yang sudah diterima & selesai:", latestPlafondValue);
    }

    // Jika masih null, ambil dari Plafond utama
    if (!latestPlafondValue) {
      const latestPlafondNull = await PlafondUpdate.findOne({
          attributes: ["plafond_saat_ini"],
          where: { id_pinjaman: null },
          order: [["id_plafondupdate", "DESC"]],
          raw: true,
        });

        latestPlafondValue = latestPlafondNull?.plafond_saat_ini || null;
      console.log("Plafond dari tabel Plafond:", latestPlafondValue);
    }

    // Jika tetap tidak ada data, kirim respon 404
    if (!latestPlafondValue) {
      return res.status(404).json({ message: "Data plafond tidak ditemukan" });
    }

    console.log("Latest Plafond:", parseFloat(latestPlafondValue));
    return res.status(200).json({ latestPlafond: parseFloat(latestPlafondValue) });

  } catch (error) {
    console.error("Error fetching plafond data:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



// Untuk Beranda Admin
router.get("/plafond-angsuran", async (req, res) => {
  try {
    const plafondUpdate = await PlafondUpdate.findOne({
      order: [["id_plafondupdate", "DESC"]],
      limit: 1,
    });

    let totalDibayar = 0;

    if (plafondUpdate) {
      const updatePlafondPinjaman = parseFloat(plafondUpdate.plafond_saat_ini);

      const latestPlafond = await Plafond.findOne({
        order: [["id_plafond", "DESC"]],
      });
  
      if (!latestPlafond) {
        return res.status(404).json({ message: "Data plafond tidak ditemukan" });
      }

      const angsuranBelumDihitung = await Angsuran.findAll({
        where: { sudah_dihitung: false },
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("sudah_dibayar")), "total_dibayar"]
        ], 
        raw: true,
      });

      totalDibayar = parseFloat(angsuranBelumDihitung[0]?.total_dibayar || 0);
      const plafondAngsuran =
        updatePlafondPinjaman + totalDibayar;
      return res.status(200).json({
        plafondAngsuran,
      });
    }

  } catch (error) {
    console.error("Error in plafond-saat-ini route:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});


router.put('/pinjaman/:id_pinjaman', async (req, res) => {
        const { id_pinjaman } = req.params;
        let { status_pengajuan, status_transfer, id_asesor } = req.body;
      
        console.log("Data yang diterima di server:", req.body);
      
        status_transfer = status_transfer || "Belum Ditransfer";
      
        try {
          if (!id_asesor) {
            return res.status(400).json({ message: 'id_asesor diperlukan' });
          }

          const pinjaman = await Pinjaman.findByPk(id_pinjaman);
          if (!pinjaman || !pinjaman.id_pinjaman) {
                console.error("ID Pinjaman tidak ditemukan.");
                toast.error("ID Pinjaman tidak ditemukan.");
                return;
          }

          if (!pinjaman) {
            return res.status(404).json({ message: 'Pinjaman tidak ditemukan' });
          }
      
          pinjaman.id_asesor = id_asesor;
          pinjaman.status_transfer = status_transfer;
          await pinjaman.save();
      
          res.status(200).json({ message: 'Pinjaman berhasil diperbarui', pinjaman });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server error' });
        }
});

router.put('/pengajuan/:id_pinjaman', async (req, res) => {
        const { id_pinjaman } = req.params;
        let { status_pengajuan, status_transfer, id_asesor } = req.body;
      
        console.log("Data yang diterima di server:", req.body);
      
        status_pengajuan = status_pengajuan || "Ditunda";
      
        try {      
          const pinjaman = await Pinjaman.findByPk(id_pinjaman);
          if (!pinjaman) {
            return res.status(404).json({ message: 'Pinjaman tidak ditemukan' });
          }
      
          pinjaman.status_pengajuan = status_pengajuan;
          await pinjaman.save();
      
          res.status(200).json({ message: 'Pinjaman berhasil diperbarui', pinjaman });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server error' });
        }
});

router.put('/batal-pengajuan/:id_pinjaman', async (req, res) => {
  const { id_pinjaman } = req.params;
  let { status_pengajuan = "Dibatalkan", status_transfer = "Dibatalkan"} = req.body;
  const transaction = await db.transaction();

  try {
    const pinjaman = await Pinjaman.findByPk(id_pinjaman);
    if (!pinjaman) {
      return res.status(404).json({ message: 'Pinjaman tidak ditemukan' });
    }

    await pinjaman.update(
      { status_pengajuan, status_transfer }, 
      { transaction }
    );

    const antrean = await AntreanPengajuan.findOne({
      where: { id_pinjaman },
      transaction,
    });

    if (antrean) {
      const nomorAntreanToDelete = antrean.nomor_antrean;

      await AntreanPengajuan.destroy({
        where: { id_pinjaman },
        transaction,
      });

      const remainingAntrean = await AntreanPengajuan.findAll({
        where: { nomor_antrean: { [Op.gt]: nomorAntreanToDelete } },
        order: [[ "nomor_antrean", "ASC" ]], 
        transaction,
      });

      let newNomorAntrean = nomorAntreanToDelete;
      for (const antreanItem of remainingAntrean) {
        await antreanItem.update(
          { nomor_antrean: newNomorAntrean }, 
          { transaction }
        );
        newNomorAntrean++;
      }
    }

    await transaction.commit();

    res.status(200).json({ message: 'Pinjaman berhasil diperbarui', pinjaman });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/pinjaman/cancel/:id_pinjaman', async (req, res) => {
const { id_pinjaman } = req.params;
const { not_compliant } = req.body; 

try {
        const pinjaman = await Pinjaman.findByPk(id_pinjaman);
        if (!pinjaman) {
        return res.status(404).json({ message: 'Pinjaman not found' });
        }

        pinjaman.not_compliant = not_compliant;
        await pinjaman.save();

        res.status(200).json({ message: 'Pinjaman status updated successfully', pinjaman });
} catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
}
});


router.put('/pinjaman/:id_pinjaman/status', async (req, res) => {
  const { id_pinjaman } = req.params;
  const { status_pelunasan } = req.body;

  try {
      const updated = await Pinjaman.update(
          { status_pelunasan },
          { where: { id_pinjaman } }
      );

      if (updated[0] === 0) {
          return res.status(404).json({ message: 'Pinjaman tidak ditemukan.' });
      }

      res.status(200).json({ message: 'Status pelunasan berhasil diperbarui.' });
  } catch (error) {
      console.error("Error updating status pelunasan:", error.message);
      res.status(500).json({ message: 'Gagal memperbarui status pelunasan.', error: error.message });
  }
});


router.post('/pengajuan/import-csv', upload.single("csvfile"), async (req,res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const data_pengajuan = [];
  
  fs.createReadStream(filePath)
  .pipe(csvParser())
  .on("data", (row) => {
    data_pengajuan.push({
      id_pinjaman: row.id_pinjaman,
      tanggal_pengajuan: new Date(row.tanggal_pengajuan),
      jumlah_pinjaman: parseInt(row.jumlah_pinjaman),
      jumlah_angsuran: parseInt(row.jumlah_angsuran),
      pinjaman_setelah_pembulatan: parseFloat(row.pinjaman_setelah_pembulatan),
      rasio_angsuran: row.rasio_angsuran,
      keperluan: row.keperluan,
      status_pengajuan: row.status_pengajuan = "Diterima",
      status_transfer: row.status_transfer = "Selesai",
      status_pelunasan: "",
      not_compliant: row.not_compliant === "true",
      id_peminjam: parseInt(row.id_peminjam, 10),
      id_asesor: parseInt(row.id_asesor, 10) || null,
    });
  })
  .on("end", async () => {
    const transaction = await db.transaction();
    try {
      if (data_pengajuan.length === 0) {
        throw new Error("Tidak ada data untuk diimport");
      }

      for (const pinjaman of data_pengajuan) {
          if (pinjaman.id_asesor) {
          const asesorExists = await Karyawan.findByPk(pinjaman.id_asesor);
                  if (!asesorExists) {
                  throw new Error(`Asesor dengan id_asesor ${pinjaman.id_asesor} tidak ditemukan`);
                  }
          console.log("Asesor: ", asesorExists);
          }

          const peminjamExists = await Karyawan.findByPk(pinjaman.id_peminjam); 
          if (!peminjamExists) {
                  throw new Error(`Peminjam dengan id_peminjam ${pinjaman.id_peminjam} tidak ditemukan`); 
          }
      }

      await Pinjaman.bulkCreate(data_pengajuan, { transaction });

      const tanggalPengajuan = data_pengajuan.reduce((acc, item) => item.tanggal_pengajuan, "");
      const idPinjaman = data_pengajuan.reduce((acc, item) => item.id_pinjaman, "");

      console.log("Id Pinjaman:", idPinjaman);
      console.log("Tanggal pengajuan: ", tanggalPengajuan);

      const totalPinjaman = data_pengajuan.reduce(( sum, item ) => sum + item.jumlah_pinjaman, 0);

      let plafondTerakhir = await PlafondUpdate.findOne({
        include: [
          {
            model: Pinjaman,
            as: "UpdatePinjamanPlafond",
            attributes: ["status_pengajuan", "status_transfer", "tanggal_pengajuan"],
            where: { status_pengajuan: "Diterima", status_transfer: "Selesai" },
          },
        ],
        attributes: ["id_pinjaman", "plafond_saat_ini"],
        order: [["id_pinjaman", "DESC"]],
        raw: true,
        transaction,
      });

    if (!plafondTerakhir) {
      plafondTerakhir = await Plafond.findOne({
        attributes: ["id_plafond", "jumlah_plafond"],
        order: [["id_plafond", "DESC"]],
        raw: true,
        transaction
      });
    }

    let plafondBaru = parseFloat(plafondTerakhir.plafond_saat_ini || plafondTerakhir.jumlah_plafond) - totalPinjaman;

    console.log("Plafond baru: ", plafondBaru);

    const antreans = await AntreanPengajuan.findAll({
      attributes: ['nomor_antrean', 'id_pinjaman'],
      order: [['nomor_antrean', 'ASC']],
      transaction,
    });

    console.log("Antreans: ", antreans);

    if (antreans.length > 0) {
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

    await PlafondUpdate.create(
      {
        tanggal_plafond_tersedia: tanggalPengajuan,
        plafond_saat_ini: plafondBaru,
        id_pinjaman: idPinjaman,
      },
      { transaction }
    );

    await transaction.commit();
  
      res.status(200).json({
        success: true,
        message: "Data Pinjaman berhasil diimpor ke database",
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