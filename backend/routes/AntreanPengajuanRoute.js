import express from "express"; 
import { getAntrean,
         getAntreanById, 
         createAntrean
} from "../controllers/AntreanPengajuanController.js";
import AntreanPengajuan from "../models/AntreanPengajuanModel.js";
import Pinjaman from "../models/PinjamanModel.js";

const router = express.Router();

router.get('/antrean', getAntrean);
router.get('/antrean/:id_antrean', getAntreanById);
router.post('/antrean', createAntrean); 


router.post("/update-antrean", async (req, res) => {
    const { id_antrean, nomor_antrean_baru } = req.body;
    
    try {
        const antrean = await AntreanPengajuan.findOne({ where: { id_antrean } });
        
        if (!antrean) {
            return res.status(404).json({ error: 'Antrean not found' });
        }
        
        antrean.nomor_antrean = nomor_antrean_baru;
        await antrean.save();
        
        res.status(200).json({ message: 'Antrean updated successfully' });
    } catch (error) {
        console.error('Error updating antrean:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("/delete-antrean/:nomor_antrean", async (req, res) => {
    const { nomor_antrean } = req.params;

    try {
        const antrean = await AntreanPengajuan.findOne({ where: { nomor_antrean } });

        if (!antrean) {
            return res.status(404).json({ error: 'Antrean not found' });
        }

        await antrean.destroy();

        res.status(200).json({ message: 'Antrean deleted successfully' });
    } catch (error) {
        console.error('Error deleting antrean:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/update-status-antrean/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const antrean = await AntreanPengajuan.findByPk(id);

      if (antrean && antrean.status_pengajuan === "Diterima" && antrean.status_transfer === "Selesai") {
          await AntreanPengajuan.destroy({
              where: { id_pinjaman: id }
          });

          const antreanSisa = await AntreanPengajuan.findAll({
              order: [['nomor_antrean', 'ASC']],
          });

          for (let i = 0; i < antreanSisa.length; i++) {
              antreanSisa[i].nomor_antrean = i + 1;
              await antreanSisa[i].save();
          }

          res.status(200).json({ message: 'Antrean diperbarui dengan sukses.' });
      } else {
          res.status(400).json({ error: 'Status tidak memenuhi syarat untuk dihapus.' });
      }
  } catch (error) {
      console.error('Error updating antrean:', error.message);
      res.status(500).json({ error: 'Gagal memperbarui antrean.' });
  }
});

router.post('/add-antrean', async (req, res) => {
  try {
      const lastAntrean = await AntreanPengajuan.findOne({
          order: [['nomor_antrean', 'DESC']],
      });

      const newNomorAntrean = lastAntrean ? lastAntrean.nomor_antrean + 1 : 1;

      const newAntrean = await AntreanPengajuan.create({
          ...req.body,
          nomor_antrean: newNomorAntrean,
      });

      res.status(201).json({ message: 'Antrean berhasil ditambahkan', data: newAntrean });
  } catch (error) {
      console.error('Error adding antrean:', error.message);
      res.status(500).json({ error: 'Gagal menambahkan antrean' });
  }
});

router.get("/antrean-pengajuan", async (req, res) => {
    try {
        const antrean = await AntreanPengajuan.findAll({
            include: [
                {
                    model: Pinjaman,
                    as: 'AntreanPinjaman',
                    attributes: [
                        "status_pengajuan",
                        "status_transfer",
                        "status_pelunasan", 
                        "id_peminjam",
                        "jumlah_pinjaman",
                        "jumlah_angsuran",
                        "keperluan",
                    ],
                    
                },
            ],
            order: [["nomor_antrean", "ASC"]], 
        }); 

        res.json(antrean);
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

router.post("/antrean-pengajuan/proses", async (req, res) => {
    try {
        console.log("Destroying antrean with accepted status...");
        await processAntreanAutomatically();
        res.json({ message: "Antrean diproses dan nomor antrean diperbarui." });

    } catch (error) {
        console.error("Error processing antrean:", error);
        res.status(500).json({ error: "Terjadi kesalahan saat memproses antrean" });
    }
});

router.get("/antrean/:id_pinjaman", async (req,res) => {
    try {

        const id_pinjaman = req.params.id_pinjaman;
        const antrean = await AntreanPengajuan.findAll({
            where: { id_pinjaman},
            attributes: ["nomor_antrean"],
            order: [["nomor_antrean", "ASC"]], 
        });

        if (!antrean.length) {
            return res.status(404).json({ message: "Nomor antrean tidak ditemukan" });
        }
        const nomorAntreanList = antrean.map(a => a.nomor_antrean);
        res.json({ nomor_antrean: nomorAntreanList });
    } catch (error) {
        console.error("Error fetching antrean by id_pinjaman:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});



export default router; 