import Karyawan from "../models/KaryawanModel.js";

export const getKaryawan = async(req, res) => {
    try {
        const response = await Karyawan.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getKaryawanById = async(req, res) => {
    try {
        const response = await Karyawan.findOne({
            where:{
                id_karyawan: req.params.id_karyawan 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createKaryawan = async(req, res) => {
    try {
        console.log(req.body);
        await Karyawan.create(req.body);
        res.status(201).json({msg: "Data Karyawan baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const updateKaryawan = async(req, res) => {
    try {
        await Karyawan.update(req.body, {
            where:{
                id_karyawan: req.params.id_karyawan
            }
        });
        res.status(200).json({msg: "Data Karyawan berhasil diperbarui"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}


export const deleteKaryawan = async(req, res) => {
    try {
        await Karyawan.destroy({
            where:{
                id_karyawan: req.params.id_karyawan
            }
        });
        res.status(200).json({msg: "Data Karyawan berhasil dihapus"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}