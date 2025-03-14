import Pinjaman from "../models/PinjamanModel.js";
import PlafondUpdate from "../models/PlafondUpdateModel.js";

export const getPlafondUpdate = async(req, res) => {
    try {
        const response = await PlafondUpdate.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getPlafondUpdateById = async(req, res) => {
    try {
        const response = await PlafondUpdate.findOne({
            where:{
                id_plafondupdate: req.params.id_plafondupdate 
            }
        });
        res.status(202).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getTanggalTersedia = async (req, res) => {
    
    try {
        const tanggalTersedia = await Pinjaman.findAll({
            include: [
                {
                    model: PlafondUpdate,
                    as: 'UpdatePinjamanPlafond', 
                    attributes: ['tanggal_plafond_tersedia'],
                },
            ],
            attributes: ['id_pinjaman'],
        });

        console.log(tanggalTersedia);
        res.status(200).json(tanggalTersedia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching tanggal tersedia" });
    }
}

export const createPlafondUpdate = async(req, res) => {
    try {
        console.log("Data diterima untuk PlafondUpdate:", req.body);
        await PlafondUpdate.create(req.body);
        res.status(201).json({msg: "Data PlafondUpdate baru telah dibuat"}); 
    } catch (error) {
        console.error("Error saat menyimpan PlafondUpdate:", error.message);
        res.status(500).json({message: error.message}); 
    }
}

