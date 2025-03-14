import express from "express";
import PlafondUpdate from "../models/PlafondUpdateModel.js";
import Pinjaman from "../models/PinjamanModel.js"

import {getPlafondUpdate,
        getPlafondUpdateById, 
        createPlafondUpdate, 
        getTanggalTersedia
} from "../controllers/PlafondUpdateController.js"; 

const router = express.Router(); 


router.get('/plafond-update', getPlafondUpdate); 
router.get('/plafond-update/:id_plafondupdate', getPlafondUpdateById);
router.get('/tanggal-tersedia:id_pinjaman', getTanggalTersedia);

router.post("/plafond-update", async (req, res) => {
        await createPlafondUpdate(req, res);
});

router.get("/tanggal-plafond-tersedia", async (req, res) => {
  const { id_pinjaman } = req.query; 

  try {
    const whereClause = id_pinjaman ? { id_pinjaman } : {};
    const tanggalPlafondTersedia = await Pinjaman.findAll({
      where: {
        whereClause,
      },
      include: [
        {
          model: PlafondUpdate,
          as: "UpdatePinjamanPlafond",
          attributes: ["tanggal_plafond_tersedia"],
        },
      ],
    });

    if (!tanggalPlafondTersedia) {
      return res.status(404).json({ message: "Data tanggal plafond not found" });
    }

    const result = tanggalPlafondTersedia.map((item) => ({
      id_pinjaman: item.id_pinjaman,
      tanggal_plafond_tersedia:
        item.PlafondUpdate?.tanggal_plafond_tersedia || "-",
    }));

    res.status(200).json({ tanggalPlafondTersedia });
    console.log("Data tanggal plafond tersedia: ", tanggalPlafondTersedia);
  } catch (error) {
    console.error("Error fetching tanggal plafond:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/plafond-saat-ini/:id_pinjaman", async (req, res) => {
        const { id_pinjaman } = req.params;
      
        try {
          const plafondTerupdate = await Pinjaman.findOne({
            where: {
              status_transfer: "Selesai",
              id_pinjaman,
            },
            include: [
              {
                model: PlafondUpdate,
                as: "PlafondUpdate", 
                where: {
                  id_pinjaman, 
                },
                attributes: ["plafond_saat_ini"], 
              },
            ],
          });
      
          if (!plafondTerupdate || !plafondTerupdate.PlafondUpdate) {
            return res.status(404).json({ message: "Plafond update tidak ditemukan" });
          }
      
          const plafondSaatIni = plafondTerupdate.plafond_saat_ini;
          res.status(200).json({ plafondSaatIni });
        } catch (error) {
          console.error("Error fetching plafondSaatIni:", error);
          res.status(500).send("Internal server error");
        }
});

export default router;