import { Sequelize } from "sequelize";
import db from "../config/database.js";

const {DataTypes} = Sequelize;

const Plafond = db.define('plafond', {
    id_plafond: {
        type: DataTypes.STRING, 
        primaryKey: true,
        autoIncrement: true,
    },
    tanggal_penetapan: DataTypes.DATEONLY,
    jumlah_plafond: DataTypes.DECIMAL(19,2),
    keterangan: DataTypes.TEXT,
}, {
    freezeTableName: true , 
    timestamps: true,
    hooks: {
        beforeCreate: async (plafond, options) => {
            const lastRecord = await Plafond.findOne({
                order: [['id_plafond', 'DESC']]
            }); 
            let newId = "PL001"; 

            if (lastRecord && lastRecord.id_plafond) {
                const lastIdNumber = parseInt(lastRecord.id_plafond.substring(2), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(3, '0');
                newId = `PL${incrementedIdNumber}`;
            }
            plafond.id_plafond = newId;
        }
    }
}); 

export default Plafond; 

(async()=> {
    await db.sync();
})(); 