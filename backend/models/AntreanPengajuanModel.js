import { Op, Sequelize } from "sequelize";
import db from "../config/database.js";
import Pinjaman from "./PinjamanModel.js";

const { DataTypes } = Sequelize;

const AntreanPengajuan = db.define(
  "antrean_pengajuan",
  {
    id_antrean: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nomor_antrean: DataTypes.INTEGER,
    id_pinjaman: {
      type: DataTypes.STRING,

      references: {
        model: Pinjaman,
        key: "id_pinjaman",
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    hooks: {
      beforeCreate: async (antrean_pengajuan) => {
        try {
          const lastRecord = await AntreanPengajuan.findOne({
            order: [["nomor_antrean", "DESC"]],
          });

          const newNomorAntrean = lastRecord ? lastRecord.nomor_antrean + 1 : 1;
          const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
          antrean_pengajuan.nomor_antrean = newNomorAntrean;
          antrean_pengajuan.id_antrean = `${today}_${newNomorAntrean}`;
        } catch (error) {
          console.error("Error in beforeCreate hook:", error.message);
          throw error;
        }
      },
    },
  }
);


export default AntreanPengajuan;

(async () => {
  try {
    await db.sync();
    console.log("Database synchronized.");
  } catch (error) {
    console.error("Error syncing database:", error.message);
  }
})();