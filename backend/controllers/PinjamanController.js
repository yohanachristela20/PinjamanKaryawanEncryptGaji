import Pinjaman from "../models/PinjamanModel.js";
import Karyawan from '../models/KaryawanModel.js';
import Angsuran from "../models/AngsuranModel.js";
import AntreanPengajuan from "../models/AntreanPengajuanModel.js";
import PlafondUpdate from "../models/PlafondUpdateModel.js";
import db from "../config/database.js";
import { Sequelize, Op, where } from "sequelize";

export const getPinjaman = async(req, res) => {
    try {
        const response = await Pinjaman.findAll({
          include: [
            {
              model: Karyawan,
              as: "Peminjam",
              attributes: ["id_karyawan", "nama", "tanggal_masuk", "gaji_pokok", "departemen", "jenis_kelamin", "divisi", "tanggal_lahir"], 
            },
            {
                model: Angsuran,
                as: 'AngsuranPinjaman',
                attributes: ['belum_dibayar', 'id_angsuran', 'bulan_angsuran', 'status'],
                where: {
                    [Op.and]: [
                      db.literal(
                        `AngsuranPinjaman.id_angsuran = (SELECT MAX(id_angsuran) FROM angsuran WHERE angsuran.id_pinjaman = pinjaman.id_pinjaman)`
                      ),
                    ],
                },
                required: false
            },
            {
                model: AntreanPengajuan,
                as: "AntreanPinjaman",
                attributes: ["nomor_antrean", "id_antrean"],
            },
            {
                model: Angsuran,
                as: 'SudahDibayar',
                attributes: ['sudah_dibayar']

            },

            {
                model: Angsuran,
                as: 'BelumDibayar',
                attributes: ['belum_dibayar']

            },
            {
                model: Karyawan,
                as: 'Asesor',
                attributes: ["nama"]
            }, 
            {
                model: PlafondUpdate,
                as: 'UpdatePinjamanPlafond',
                attributes: ["tanggal_plafond_tersedia"], 
            },
          ],
        });
        res.status(200).json(response);
      } catch (error) {
        console.error("Error fetching pinjaman:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
      }    
};

export const getPinjamanById = async(req, res) => {
    try {
        const response = await Pinjaman.findOne({
            where:{
                id_pinjaman: req.params.id_pinjaman 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createPinjaman = async (req, res) => {
    const transaction = await db.transaction(); 
    try {
        const {
            tanggal_plafond_tersedia, 
            plafond_saat_ini, 
            sudah_dihitung,
            ...pinjamanData
        } = req.body;

        const newPinjaman = await Pinjaman.create(req.body, { transaction });

        await Angsuran.update(
          { sudah_dihitung: true },
          {
              where: { sudah_dihitung: false },
              transaction,
          }
        );

        const lastRecord = await AntreanPengajuan.findOne({
            order: [["nomor_antrean", "DESC"]],
            transaction, 
        });

        let newNomorAntrean = 1;
        let newIdAntrean; 
        if (lastRecord) {
            newNomorAntrean = lastRecord.nomor_antrean + 1; 
        }

        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        newIdAntrean = `${today}_${newNomorAntrean}`; 

        let existingAntrean;
        do {
            existingAntrean = await AntreanPengajuan.findOne({
                where: { id_antrean: newIdAntrean },
                transaction,
            });

            if (existingAntrean) {
                newNomorAntrean++;
                newIdAntrean = `${today}_${newNomorAntrean}`;
            }
        } while (existingAntrean);

        const newAntrean = await AntreanPengajuan.create(
          {
              id_antrean: newIdAntrean,
              nomor_antrean: newNomorAntrean,
              id_pinjaman: newPinjaman.id_pinjaman, 
          },
          { transaction }
        );

        await PlafondUpdate.create(
          {
            tanggal_plafond_tersedia,
            plafond_saat_ini,
            id_pinjaman: newPinjaman.id_pinjaman,
          },
          { transaction }
        );


        await transaction.commit();
        res.status(201).json({
            message: "Data Pinjaman baru dan nomor antrean berhasil dibuat.",
            data: {
              pinjaman: newPinjaman,
              antrean: newAntrean,
            }
        });
    } catch (error) {
        await transaction.rollback(); 
        console.error("Error creating pinjaman:", error); 

        if (error.errors) {
            console.error("Validation errors:", error.errors);
        }

        res.status(500).json({ 
            message: "Gagal membuat pinjaman dan antrean.",
            error: error.message,
            validationErrors: error.errors || [] 
        });
    }
};

export const getDataPinjaman = async (req, res) => {
  try {
    const { year } = req.query; 

    const whereCondition = {
      status_pengajuan: "Diterima",
      status_transfer: "Selesai",
    };

    if (year) {
      whereCondition.tanggal_pengajuan = {
        [Sequelize.Op.between]: [
          `${year}-01-01`,
          `${year}-12-31`,
        ],
      };
    }

    const pinjamanData = await Pinjaman.findAll({
      where: whereCondition,
      include: [
        {
          model: Karyawan,
          as: "Peminjam",
          attributes: ["departemen"],
        },
      ],
      attributes: [
        [Sequelize.col("Peminjam.departemen"), "departemen"],
        [Sequelize.fn("SUM", Sequelize.col("jumlah_pinjaman")), "jumlah_pinjaman"],
      ],
      group: ["Peminjam.departemen"],
      raw: true,
    });

    const formattedData = pinjamanData.map((item) => ({
      ...item,
      jumlah_pinjaman: parseFloat(item.jumlah_pinjaman),
    }));

    if (formattedData.length > 0) {
      res.status(200).json(formattedData);
    } else {
      res.status(404).json({ message: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDataPerDivisi = async (req, res) => {
  try {
      const { departemen, bulan, tahun } = req.query;

      console.log("Received Query Params:", { departemen, bulan, tahun });

      const whereCondition = {
          status_pengajuan: "Diterima",
          status_transfer: "Selesai",
      };

      if (departemen) {
          whereCondition["$Peminjam.departemen$"] = departemen;
      }

      if (bulan && tahun) {
        const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
        const endDate = new Date(tahun, bulan, 0); // Mendapatkan tanggal terakhir di bulan tersebut
        const endDateString = endDate.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
    
        whereCondition["tanggal_pengajuan"] = {
            [Sequelize.Op.gte]: startDate,
            [Sequelize.Op.lte]: endDateString,
        };
      } 
      else if (tahun) {
        console.log(`Filtering data for entire year: ${tahun}`);
        whereCondition["tanggal_pengajuan"] = {
            [Sequelize.Op.gte]: `${tahun}-01-01`,
            [Sequelize.Op.lte]: `${tahun}-12-31`,
        };
      }

      const pinjamanData = await Pinjaman.findAll({
          where: whereCondition,
          include: [
              {
                  model: Karyawan,
                  as: "Peminjam",
                  attributes: ["divisi", "departemen"],
              },
          ],
          attributes: [
              [Sequelize.col("Peminjam.divisi"), "divisi"],
              [Sequelize.fn("SUM", Sequelize.col("jumlah_pinjaman")), "jumlah_pinjaman"],
          ],
          group: ["Peminjam.divisi"],
          raw: true,
      });

      const formattedData = pinjamanData.map((item) => ({
          ...item,
          jumlah_pinjaman: parseFloat(item.jumlah_pinjaman),
      }));

      console.log("Formatted Data:", formattedData);

      if (formattedData.length > 0) {
          res.status(200).json(formattedData);
      } else {
          res.status(200).json({ message: "Data tidak ditemukan", data: [] });
      }
  } catch (error) {
      console.error("Error fetching data:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

export const filterPiutangTahunan = async (req, res) => {
  try {
    const pinjamanData = await Pinjaman.findAll({
      where: {
        status_pengajuan: "Diterima",
        status_transfer: "Selesai", 
      },
      include: [
        {
          model: Karyawan,
          as: "Peminjam",
          attributes: ["departemen"],
        },
      ],

      attributes: ["tanggal_pengajuan"],
      raw: true,
    });

    console.log("Raw Data: ", pinjamanData); 

    if (pinjamanData.length > 0) {
      res.status(200).json(pinjamanData); 
    } else {
      res.status(404).json({ message: "Data tidak ditemukan" });
    }
    
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
  

export const getPinjamanData = async (req, res) => {
    try {
        const pinjamanData = await Pinjaman.findAll({
            include: [
                {
                    model: Karyawan,
                    as: 'Peminjam',
                    attributes: ["nama", 'tanggal_masuk', 'departemen', 'gaji_pokok', 'jenis_kelamin', 'divisi']
                },
                {
                    model: Karyawan,
                    as: 'Asesor',
                    attributes: ["nama"]
                },
                {
                    model: Angsuran,
                    as: 'AngsuranPinjaman',
                    attributes: ['belum_dibayar', 'id_angsuran', 'bulan_angsuran', 'status'],
                    where: {
                        [Sequelize.Op.and]: [
                            Sequelize.literal(`AngsuranPinjaman.id_angsuran = (SELECT MAX(id_angsuran) FROM angsuran WHERE angsuran.id_pinjaman = pinjaman.id_pinjaman)`)
                        ]
                    },
                    required: false
                }
            ],
            attributes: [
                'id_pinjaman', 
                'jumlah_pinjaman', 
                'jumlah_angsuran', 
                'pinjaman_setelah_pembulatan',
                [Sequelize.literal(`(
                    SELECT 
                        COALESCE(SUM(a.sudah_dibayar), 0)
                    FROM angsuran a
                    WHERE a.id_pinjaman = pinjaman.id_pinjaman
                )`), 'totalSudahDibayar'],
            ],
            group: ['pinjaman.id_pinjaman', 'Peminjam.id_karyawan', 'Asesor.id_karyawan', 'Peminjam.departemen']
        });

        res.status(200).json(pinjamanData);
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }

};


export const getTotalPinjamanByPeminjam = async (req, res) => {
    const { id_peminjam } = req.params;
    try {
      if (!id_peminjam) {
        return res.status(400).json({ message: "ID Peminjam tidak diberikan." });
      }
  
      const totalPinjaman = await Pinjaman.sum('jumlah_pinjaman', {
        where: { id_peminjam }
      });
  
      console.log("Total Pinjaman for peminjam ID " + id_peminjam + ": ", totalPinjaman);  
  
      if (totalPinjaman === null) {
        return res.status(404).json({ message: "No pinjaman data found for this peminjam." });
      }
  
      res.status(200).json({ totalPinjaman: totalPinjaman || 0 });
    } catch (error) {
      console.error("Error fetching total pinjaman:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };



  