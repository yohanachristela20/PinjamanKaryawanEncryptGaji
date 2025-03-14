import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Karyawan from "./KaryawanModel.js";

const {DataTypes} = Sequelize;

const Pinjaman = db.define('pinjaman', {
    id_pinjaman: {
        type: DataTypes.STRING, 
        primaryKey: true,
    }, 
    tanggal_pengajuan: DataTypes.DATEONLY,
    jumlah_pinjaman: DataTypes.DECIMAL(19,2), 
    jumlah_angsuran: DataTypes.DECIMAL(19,2),
    pinjaman_setelah_pembulatan: DataTypes.DECIMAL(19,2),
    rasio_angsuran: DataTypes.DECIMAL(19,2),
    keperluan: DataTypes.STRING,
    status_pengajuan: DataTypes.STRING,
    status_transfer: DataTypes.STRING,
    status_pelunasan: DataTypes.STRING,
    not_compliant: DataTypes.BOOLEAN, 
    id_peminjam: {
        type: DataTypes.INTEGER,
        
        references: {
            model: Karyawan, 
            key: 'id_karyawan' 
        }
    }, 
    id_asesor: {
        type: DataTypes.INTEGER, 

        references:{
            model: Karyawan,
            key: 'id_karyawan'
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (pinjaman, options) => {
            const lastRecord = await Pinjaman.findOne({
                order: [['id_pinjaman', 'DESC']]
            }); 
            let newId = "P00001";

            if (lastRecord && lastRecord.id_pinjaman) {
                const lastIdNumber = parseInt(lastRecord.id_pinjaman.substring(1), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `P${incrementedIdNumber}`;
            }
            pinjaman.id_pinjaman = newId;
        }
    } 
}); 

export default Pinjaman; 

(async()=> {
    await db.sync();
})(); 