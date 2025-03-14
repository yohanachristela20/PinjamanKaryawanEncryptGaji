import Plafond from "../models/PlafondModel.js";
import Pinjaman from "../models/PinjamanModel.js";
import PlafondUpdate from "../models/PlafondUpdateModel.js";
import AntreanPengajuan from "../models/AntreanPengajuanModel.js";
import db from "../config/database.js";
import { Sequelize, Op, where } from "sequelize";


export const getPlafond = async(req, res) => {
    try {
        const response = await Plafond.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getJumlahPlafond = async(req, res) => {
    try {

        const totalPlafond = await Plafond.sum("jumlah_plafond");
        res.status(200).json({ totalPlafond }); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getPlafondById = async(req, res) => {
    try {
        const response = await Plafond.findOne({
            where:{
                id_plafond: req.params.id_plafond 
            }
        });
        res.status(202).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createPlafond = async(req, res) => {
    const transaction = await db.transaction();
    try {
        const { jumlah_plafond } = req.body;
        let jumlahPlafond = parseFloat(jumlah_plafond);
        console.log("Jumlah plafond: ", jumlahPlafond);
        
        const newPlafond = await Plafond.create(req.body, { transaction });

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
        });

        if (!plafondTerakhir) {
            console.log("Tidak ada data plafond terakhir, menginisialisasi dengan nilai default.");
        }

        const plafondTerakhirSaatIni = plafondTerakhir?.plafond_saat_ini || 0;

        console.log("Plafond terakhir sebelum update: ", plafondTerakhirSaatIni);

        const totalAngsuranHarusDibayar = await Pinjaman.sum("jumlah_angsuran", {
            where: {
                status_pelunasan: { [Op.ne]: "Lunas" },
                status_pengajuan: { [Op.notIn]: ["Ditunda", "Dibatalkan"] },
                status_transfer: { [Op.notIn]: ["Belum Ditransfer", "Dibatalkan"] },
            },
        });

        console.log("Total angsuran yang harus dibayar: ", totalAngsuranHarusDibayar);

        let plafondBaru = parseFloat(plafondTerakhirSaatIni) + jumlahPlafond;
        console.log("Plafond baru: ", plafondBaru);

        if (plafondTerakhir && plafondTerakhir.id_pinjaman) {
            await PlafondUpdate.update(
                { plafond_saat_ini: plafondBaru },
                { where: { id_pinjaman: plafondTerakhir.id_pinjaman }, transaction }
            );
        } else {
            let today = new Date();
            let formattedToday = today.toISOString().split("T")[0]; 
            await PlafondUpdate.create(
                { 
                    plafond_saat_ini: plafondBaru,
                    tanggal_plafond_tersedia: formattedToday,
                }, 
                {transaction}
            );
        }


        let antreans = await AntreanPengajuan.findAll({
            attributes: ['nomor_antrean', 'id_pinjaman'],
            order: [['nomor_antrean', 'ASC']],
        });

        console.log("Antreans: ", antreans);

        const antreanData = await Pinjaman.findAll({
            where: {
                id_pinjaman: {
                    [Op.in]: antreans.map(antrean => antrean.id_pinjaman),
                },
            },
            attributes: ['id_pinjaman', 'jumlah_pinjaman'],
            transaction,
        });

        const pinjamanMap = new Map(antreanData.map(item => [item.id_pinjaman, item.jumlah_pinjaman]));

        let plafondSaatIni = plafondBaru;

        // Loop untuk mengelola antrean 1 hingga z
        for (let i = 0; i < antreans.length; i++) {
            const antrean = antreans[i];
            const jumlahPinjamanAntrean = pinjamanMap.get(antrean.id_pinjaman) || 0;
        
            // Kurangi plafond_saat_ini untuk antrean berikutnya
            plafondSaatIni = parseFloat((plafondSaatIni - jumlahPinjamanAntrean).toFixed(2));

            // Update plafond_saat_ini untuk antrean saat ini
            if (plafondSaatIni > 0) {
                let today = new Date();
                let formattedToday = today.toISOString().split("T")[0]; 
                await PlafondUpdate.update(
                    {
                        plafond_saat_ini: plafondSaatIni,
                        tanggal_plafond_tersedia: formattedToday,
                    },
                    { 
                        where: { id_pinjaman: antrean.id_pinjaman },
                        transaction,
                    }
                );
            } else if (plafondSaatIni < jumlahPinjamanAntrean) {
                const nextMonthDate = new Date();
                nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

                let bulan = Math.floor(plafondSaatIni / totalAngsuranHarusDibayar);
                let bulanTambahan = Math.abs(bulan);
                console.log("Plafond saat ini: ", plafondSaatIni);
                console.log("Plafond sudah dibayar: ", totalAngsuranHarusDibayar);
                console.log("Bulan tambahan: ", bulanTambahan);
                let tanggalPlafondTersedia = new Date();

                tanggalPlafondTersedia.setMonth(tanggalPlafondTersedia.getMonth() + bulanTambahan);
                tanggalPlafondTersedia.setDate(1);

                await PlafondUpdate.update(
                    {
                        plafond_saat_ini: plafondSaatIni,
                        tanggal_plafond_tersedia: tanggalPlafondTersedia,
                    },
                    { 
                        where: { id_pinjaman: antrean.id_pinjaman}, 
                        transaction
                    }, 
                );       
            }
        }
        await transaction.commit();
        res.status(201).json({msg: "Data Plafond baru telah dibuat", data: {newPlafond}}); 
    } catch (error) {
        await transaction.rollback();
        console.error("Error: ", error.message);
        res.status(500).json({message: error.message}); 
    }
}

export const getLastPlafondId = async (req, res) => {
    try {
        const latestPlafond = await Plafond.findOne({
            order: [['id_plafond', 'DESC']]
        });

        let nextId;
        if (latestPlafond) {
            const numericPart = parseInt(latestPlafond.id_plafond.slice(2), 10);
            nextId = `PL${String(numericPart + 1).padStart(3, '0')}`;
        } else {
            nextId = 'PL001';
        }

        res.json({ nextId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

};

