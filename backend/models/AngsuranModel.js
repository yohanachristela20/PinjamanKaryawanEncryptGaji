import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Pinjaman from './PinjamanModel.js';
import Karyawan from './KaryawanModel.js'; 

const {DataTypes} = Sequelize; 

const Angsuran = db.define('angsuran', {
    id_angsuran: {
        type: DataTypes.STRING, 
        primaryKey: true,  
    },
    tanggal_angsuran: DataTypes.DATEONLY, 
    bulan_angsuran: DataTypes.INTEGER, 
    keterangan: DataTypes.TEXT, 
    status: DataTypes.STRING,
    sudah_dibayar: DataTypes.DECIMAL(19,2),
    belum_dibayar: DataTypes.DECIMAL(19,2),
    // rasio_angsuran: DataTypes.DECIMAL(19,2),
    sudah_dihitung: DataTypes.BOOLEAN, 
    id_peminjam: {
        type: DataTypes.INTEGER,
        
        references: {
            model: Karyawan, 
            key: 'id_karyawan' 
        }
    }, 
    id_pinjaman: {
        type: DataTypes.STRING,
        
        references: {
            model: Pinjaman, 
            key: 'id_pinjaman' 
        }
    }

}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (angsuran, options) => {
            const lastRecord = await Angsuran.findOne({
                order: [['id_angsuran', 'DESC']]
            }); 
            let newId = "A00001"; 

            if (lastRecord && lastRecord.id_angsuran) {
                const lastIdNumber = parseInt(lastRecord.id_angsuran.substring(1), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `A${incrementedIdNumber}`;
            }
            angsuran.id_angsuran = newId;
            console.log("ID angsuran yang dihasilkan:", newId);
        }
    } 
}); 

export default Angsuran; 

(async() => {
    await db.sync(); 
})(); 
