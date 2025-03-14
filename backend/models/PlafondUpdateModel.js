import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Pinjaman from "./PinjamanModel.js";

const {DataTypes} = Sequelize;

const PlafondUpdate = db.define('plafond_update', {
    id_plafondupdate: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    tanggal_plafond_tersedia: DataTypes.DATEONLY,
    plafond_saat_ini: DataTypes.DECIMAL(19,2),
    id_pinjaman: {
        type: DataTypes.STRING,
        
        references: {
            model: Pinjaman, 
            key: 'id_pinjaman' 
        }
    }, 
}, {
    freezeTableName: true , 
    timestamps: true,
    hooks: {
        beforeCreate: async (plafond_update, options) => {
            const lastRecord = await PlafondUpdate.findOne({
                order: [['id_plafondupdate', 'DESC']]
            }); 
            let newId = "PLU0001";

            if (lastRecord && lastRecord.id_plafondupdate) {
                const lastIdNumber = parseInt(lastRecord.id_plafondupdate.substring(3), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(4, '0');
                newId = `PLU${incrementedIdNumber}`;
            }
            plafond_update.id_plafondupdate = newId;
        }
    }
}); 

export default PlafondUpdate; 

(async()=> {
    await db.sync();
})(); 