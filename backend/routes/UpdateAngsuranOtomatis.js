import Angsuran from "../models/AngsuranModel.js";
import Pinjaman from "../models/PinjamanModel.js";
import PlafondUpdate from "../models/PlafondUpdateModel.js";
import AntreanPengajuan from "../models/AntreanPengajuanModel.js";
import { Op, Sequelize, where } from "sequelize";
import db from "../config/database.js";


// alur update angsuran otomatis berdsasarkan plafond update terakhir yg status transfer = Selesai 

//Fix 

// const updateAngsuranOtomatis = async () => {
//     const transaction = await db.transaction();
//     try {
//         const today = new Date();
//         const formattedToday = today.toISOString().split("T")[0];
//         const dayOfMonth = today.getDate();
//         const sudahDihitung = false;

//         if (dayOfMonth !== 4) {
//             console.log("Update angsuran otomatis hanya dijalankan pada tanggal 4.");
//             return;
//         }

//         const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//         const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

//         const excludedPinjamanIds = await Pinjaman.findAll({
//             where: {
//                 tanggal_pengajuan: {
//                     [Op.gte]: thisMonthStart,
//                     [Op.lt]: nextMonthStart,
//                 },
//                 [Op.and]: Sequelize.where(
//                     Sequelize.fn("DATE", Sequelize.col("tanggal_pengajuan")),
//                     `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-1`
//                 ),
//             },
//             attributes: ["id_pinjaman"],
//         }).then((data) => data.map((item) => item.id_pinjaman));


//         const existingUpdate = await Angsuran.findOne({
//             where: {
//                 tanggal_angsuran: {
//                     [Op.gte]: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-1`,
//                 },
//             },
//         });

//         if (existingUpdate) {
//             console.log("Angsuran sudah diperbarui bulan ini.");
//             return;
//         }


//         // Ambil plafond terakhir
//         const plafondTerakhir = await PlafondUpdate.findOne({
//             include: [
//                 {
//                     model: Pinjaman,
//                     as: "UpdatePinjamanPlafond",
//                     attributes: ["status_pengajuan", "status_transfer"],
//                     where: { status_pengajuan: "Diterima", status_transfer: "Selesai" },
//                 },
//             ],
//             attributes: ["id_pinjaman", "plafond_saat_ini"],
//             order: [["id_pinjaman", "DESC"]],
//             raw: true,
//         });

//         if (!plafondTerakhir) {
//             console.log("Data plafond terakhir tidak ditemukan.");
//             return;
//         }

//         console.log("Plafond terakhir sebelum update: ", plafondTerakhir.plafond_saat_ini);

//          // Menghitung total angsuran yang harus dibayar dari Pinjaman
//          const totalAngsuranHarusDibayar = await Pinjaman.sum("jumlah_angsuran", {
//             where: {
//                 status_pelunasan: { [Op.ne]: "Lunas" },
//                 status_pengajuan: { [Op.notIn]: ["Ditunda", "Dibatalkan"] },
//                 status_transfer: { [Op.notIn]: ["Belum Ditransfer", "Dibatalkan"] },
//             },
//         });

//         console.log("Total angsuran yang harus dibayar: ", totalAngsuranHarusDibayar);

        
//         // Menambahkan total angsuran masuk ke plafond baru
//         let plafondBaru = parseFloat(plafondTerakhir.plafond_saat_ini || 0) + totalAngsuranHarusDibayar;

//         console.log("Plafond baru : ", plafondBaru);

//         let plafondBaruAwal = plafondBaru;

//         await PlafondUpdate.update(
//             { plafond_saat_ini: plafondBaru },
//             { where: { id_pinjaman: plafondTerakhir.id_pinjaman }, transaction }
//         );

//         console.log("Plafond setelah angsuran masuk: ", plafondBaru);

//         let antreans = await AntreanPengajuan.findAll({
//             attributes: ['nomor_antrean', 'id_pinjaman'],
//             order: [['nomor_antrean', 'ASC']],
//         });

//         // Simpan data angsuran baru ke tabel Angsuran
//         const lastAngsuran = await Angsuran.findAll({
//             attributes: [
//                 "id_pinjaman",
//                 [ Sequelize.fn("MAX", Sequelize.col("id_angsuran")), "latest_id_angsuran"],
//             ],
//             // where: { sudah_dihitung: "false" },
//             group: ["id_pinjaman"],
//             raw: true,
            
//         })
//         // let lastIdNumber = lastAngsuran ? parseInt(lastAngsuran.id_angsuran.substring(1), 10) : 0;

//         let lastIdNumber = 0;
//         const lastRecord = await Angsuran.findOne({ order: [["id_angsuran", "DESC"]] });
//         if (lastRecord && lastRecord.id_angsuran) {
//             lastIdNumber = parseInt(lastRecord.id_angsuran.substring(1), 10);
//         }

//         console.log("Last angsuran: ", lastAngsuran);
//         const angsuranData = await Angsuran.findAll({
//             where: {
//                 id_angsuran: {
//                     [Op.in]: lastAngsuran.map(data => data.latest_id_angsuran)
//                 },
//                 // sudah_dihitung: false, 
//             },
//             include: [
//                 {
//                     model: Pinjaman,
//                     as: 'AngsuranPinjaman',
//                     attributes: ['pinjaman_setelah_pembulatan', 'status_pelunasan', 'jumlah_angsuran', 'jumlah_pinjaman'],
//                     where: {
//                         status_pelunasan: {
//                             [Op.ne]: 'Lunas',
//                         },
//                         id_pinjaman: {
//                             [Op.notIn]: excludedPinjamanIds,
//                         }
//                     },
//                 },
//             ],
//             where: {
//                 belum_dibayar: {
//                     [Op.gt]: 0, //operator greater than
//                 },
//                 bulan_angsuran: {
//                     [Op.lt]: 60, //operator less than
//                 },
//                 // sudah_dihitung: false ,
//             },
//             order: [["id_pinjaman", "ASC"], ["id_angsuran", "DESC"]],
//         });

//         console.log("Angsuran data: ", angsuranData);

//         const result = {};
//         angsuranData.forEach((item) => {
//         if (!result[item.id_pinjaman]) {
//             result[item.id_pinjaman] = item;
//         }
//         });

//         const angsuranDataTerakhir = Object.values(result);


//         const angsuranPertama = await Pinjaman.findAll({
//             where: {
//                 status_pelunasan: {
//                     [Op.ne]: 'Lunas',
//                 },
//                 status_pengajuan: {
//                     [Op.notIn]: ['Ditunda', 'Dibatalkan'],
//                 },
//                 status_transfer: {
//                     [Op.notIn]: ['Belum Ditransfer', 'Dibatalkan'],
//                 },
//             },
//             attributes: ['id_pinjaman', 'jumlah_angsuran', 'pinjaman_setelah_pembulatan', 'id_peminjam', 'jumlah_pinjaman'],
//         });

//         console.log("Angsuran pertama: ", angsuranPertama);


//         for (const item of angsuranPertama) {
//             const existingAngsuranPertama = await Angsuran.findOne({
//                 where: { id_pinjaman: item.id_pinjaman, bulan_angsuran: 1},
//             });

//             if (!existingAngsuranPertama) {
//                 lastIdNumber++;
//                 const newId = `A${lastIdNumber.toString().padStart(5, "0")}`;

//                 const jumlahAngsuran = item.jumlah_angsuran;
//                 const belumDibayar = parseFloat((item.pinjaman_setelah_pembulatan - jumlahAngsuran).toFixed(2));
//                 const statusBaru = belumDibayar <= 0 ? "Lunas" : "Belum Lunas";
//                 const sudahDihitung = "";

//                 await Angsuran.create({
//                     id_angsuran: newId,
//                     tanggal_angsuran: formattedToday,
//                     sudah_dibayar: jumlahAngsuran,
//                     belum_dibayar: Math.max(0, belumDibayar),
//                     bulan_angsuran: 1,
//                     sudah_dihitung: false,
//                     status: statusBaru,
//                     id_peminjam: item.id_peminjam,
//                     id_pinjaman: item.id_pinjaman,
//                 });

//                 if (statusBaru === "Lunas") {
//                     await Pinjaman.update(
//                         { status_pelunasan: "Lunas" },
//                         { where: { id_pinjaman: item.id_pinjaman } }
//                     );
//                 }
//             }
//         }

//         // Jika ada antrean, lanjut proses antrean
//         if (antreans.length > 0) {
//             const antreanData = await Pinjaman.findAll({
//                 where: {
//                     id_pinjaman: {
//                         [Op.in]: antreans.map((antrean) => antrean.id_pinjaman),
//                     },
//                 },
//                 attributes: ["id_pinjaman", "jumlah_pinjaman"],
//                 transaction,
//             });

//             const pinjamanMap = new Map(antreanData.map((item) => [item.id_pinjaman, item.jumlah_pinjaman]));

//             let plafondSaatIni = plafondBaru;


//             for (let i = 0; i < antreans.length; i++) {
//                 const antrean = antreans[i];
//                 const jumlahPinjamanAntrean = pinjamanMap.get(antrean.id_pinjaman) || 0;

//                 // Kurangi plafond_saat_ini untuk antrean berikutnya
//                 plafondSaatIni = parseFloat((plafondSaatIni - jumlahPinjamanAntrean).toFixed(2));

//                 if (plafondSaatIni > 0) {
//                     let tanggalPlafondTersedia = new Date();
//                     await PlafondUpdate.update(
//                         {
//                             plafond_saat_ini: plafondSaatIni,
//                             tanggal_plafond_tersedia: tanggalPlafondTersedia,
//                         },
//                         { where: { id_pinjaman: antrean.id_pinjaman }, transaction }
//                     );
//                 } else if (plafondSaatIni < jumlahPinjamanAntrean) {
//                     const nextMonthDate = new Date();
//                     nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

//                     let bulanTambahan = Math.abs(Math.floor(plafondSaatIni / totalAngsuranHarusDibayar));
//                     let tanggalPlafondTersedia = new Date();
//                     tanggalPlafondTersedia.setMonth(tanggalPlafondTersedia.getMonth() + bulanTambahan);
//                     tanggalPlafondTersedia.setDate(1);

//                     await PlafondUpdate.update(
//                         {
//                             plafond_saat_ini: plafondSaatIni,
//                             tanggal_plafond_tersedia: tanggalPlafondTersedia,
//                         },
//                         { where: { id_pinjaman: antrean.id_pinjaman }, transaction }
//                     );
//                 }
//             }
//         }

//         //otomatisasi angsuran jika Angsuran != null
//         for (const item of angsuranDataTerakhir) {
//             const existingAngsuranTerakhir = await Angsuran.findOne({
//                 where: { id_pinjaman: item.id_pinjaman, sudah_dihitung: false},
//             });

//             lastIdNumber++;
//             const newId = `A${lastIdNumber.toString().padStart(5, "0")}`;

//                 const jumlahAngsuran = item.AngsuranPinjaman.jumlah_angsuran;
//                 const jumlahPinjaman = item.jumlah_pinjaman;
//                 let sudahDibayar = item.sudah_dibayar;
//                 let sudahDihitung = item.sudah_dihitung;

//                 const belumDibayar = parseFloat((item.belum_dibayar - jumlahAngsuran).toFixed(2));
//                 const statusBaru = belumDibayar <= 0 ? 'Lunas' : 'Belum Lunas';
//                 const peminjam = item.id_peminjam;

//                 await Angsuran.create({
//                     id_angsuran: newId,
//                     tanggal_angsuran: formattedToday,
//                     sudah_dibayar: jumlahAngsuran,
//                     belum_dibayar: Math.max(0, belumDibayar),
//                     bulan_angsuran: item.bulan_angsuran + 1,
//                     status: statusBaru,
//                     sudah_dihitung: false,
//                     id_peminjam: peminjam,
//                     id_pinjaman: item.id_pinjaman,
//                 });

//                 if (statusBaru === 'Lunas') {
//                     await Pinjaman.update(
//                         { status_pelunasan: 'Lunas' },
//                         { where: { id_pinjaman: item.id_pinjaman } }
//                     );
//                 }

//                 // let totalDibayar = angsuranPertama.reduce((sum, data) => sum - parseFloat(data.jumlah_pinjaman || 0), 0);
//                 // let totalDibayarAwal = totalDibayar;
//                 // console.log("Total dibayar: ", totalDibayar);

                
//                 let antreans = await AntreanPengajuan.findAll({
//                     attributes: ['nomor_antrean', 'id_pinjaman'],
//                     order: [['nomor_antrean', 'ASC']],
//                 });

//                 if (antreans.length === 0) return;

//                 const antreanData = await Pinjaman.findAll({
//                     where: {
//                         id_pinjaman: {
//                             [Op.in]: antreans.map(antrean => antrean.id_pinjaman),
//                         },
//                     },
//                     attributes: ['id_pinjaman', 'jumlah_pinjaman'],
//                     transaction,
//                 });

//                 const pinjamanMap = new Map(antreanData.map(item => [item.id_pinjaman, item.jumlah_pinjaman]));

//                 let plafondSaatIni = plafondBaru;

//                 for (let i = 0; i < antreans.length; i++) {
//                     const antrean = antreans[i];
//                     const jumlahPinjamanAntrean = pinjamanMap.get(antrean.id_pinjaman) || 0;
                
//                     // Kurangi plafond_saat_ini untuk antrean berikutnya
//                     plafondSaatIni = parseFloat((plafondSaatIni - jumlahPinjamanAntrean).toFixed(2));
//                     // plafondSaatIni -= jumlahPinjamanAntrean;
//                     // plafondSaatIni = parseFloat(plafondSaatIni.toFixed(2)); // Pastikan tetap dalam 2 desimal


//                     // Update plafond_saat_ini untuk antrean saat ini

//                     if (plafondSaatIni > 0) {
//                         let tanggalPlafondTersedia = new Date();
//                         await PlafondUpdate.update(
//                             {
//                                 plafond_saat_ini: plafondSaatIni,
//                                 tanggal_plafond_tersedia: tanggalPlafondTersedia,
//                             },
//                             { 
//                                 where: { id_pinjaman: antrean.id_pinjaman  },
//                                 transaction,
//                             }
//                         );
//                     } else if (plafondSaatIni < jumlahPinjamanAntrean) {
//                         const nextMonthDate = new Date();
//                         nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

//                         let bulan = Math.floor(plafondSaatIni / totalAngsuranHarusDibayar);
//                         let bulanTambahan = Math.abs(bulan);
//                         console.log("Plafond saat ini: ", plafondSaatIni);
//                         console.log("Plafond baru: ", totalAngsuranHarusDibayar);
//                         console.log("Bulan tambahan: ", bulanTambahan);
//                         let tanggalPlafondTersedia = new Date();

//                         tanggalPlafondTersedia.setMonth(tanggalPlafondTersedia.getMonth() + bulanTambahan);
//                         tanggalPlafondTersedia.setDate(1);

//                         await PlafondUpdate.update(
//                             {
//                                 plafond_saat_ini: plafondSaatIni,
//                                 tanggal_plafond_tersedia: tanggalPlafondTersedia,
//                             },
//                             { 
//                                 where: { id_pinjaman: antrean.id_pinjaman},
//                                 transaction,
//                             }
//                         );
                            
//                     }
                    
                
                  
//                 }
//         }


//         await transaction.commit();
//         console.log("Update angsuran otomatis selesai.");

//         await Angsuran.update(
//             { sudah_dihitung: true },
//             { where: { sudah_dihitung: false } },
//         );
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Terjadi kesalahan: ", error);
//     }
// };

const updateAngsuranOtomatis = async () => {
    const transaction = await db.transaction();
    try {
        const today = new Date();
        const formattedToday = today.toISOString().split("T")[0];
        const dayOfMonth = today.getDate();

        if (dayOfMonth !== 19) {
            console.log("Update angsuran otomatis hanya dijalankan pada tanggal 19.");
            return;
        }

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        const existingPinjamanToday = await Pinjaman.findOne({    
            where: {
                tanggal_pengajuan: formattedToday,
            },
        });

        if (existingPinjamanToday) {
            console.log("Ada pinjaman yang diajukan pada tanggal ini. Angsuran otomatis tidak dibuat.");
            return;
        }

        const excludedPinjamanIds = await Pinjaman.findAll({
            where: {
                tanggal_pengajuan: {
                    [Op.gte]: thisMonthStart,
                    [Op.lt]: nextMonthStart,
                },
                [Op.and]: Sequelize.where(
                    Sequelize.fn("DAY", Sequelize.col("tanggal_pengajuan")),
                    dayOfMonth
                ),
            },
            attributes: ["id_pinjaman"],
        }).then((data) => data.map((item) => item.id_pinjaman));

        console.log("Pinjaman yang diajukan pada tanggal ini (tidak diproses bulan ini):", excludedPinjamanIds);

        const existingUpdate = await Angsuran.findOne({
            where: {
                tanggal_angsuran: {
                    [Op.gte]: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
                },
            },
        });

        if (existingUpdate) {
            console.log("Angsuran sudah diperbarui bulan ini.");
            return;
        }

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
            console.log("Data plafond terakhir tidak ditemukan.");
            return;
        }

        console.log("Plafond terakhir sebelum update: ", plafondTerakhir.plafond_saat_ini);

         // Menghitung total angsuran yang harus dibayar dari Pinjaman
         const totalAngsuranHarusDibayar = await Pinjaman.sum("jumlah_angsuran", {
            where: {
                status_pelunasan: { [Op.ne]: "Lunas" },
                status_pengajuan: { [Op.notIn]: ["Ditunda", "Dibatalkan"] },
                status_transfer: { [Op.notIn]: ["Belum Ditransfer", "Dibatalkan"] },
                id_pinjaman: { [Op.notIn]: excludedPinjamanIds },
            },
        });

        console.log("Total angsuran yang harus dibayar: ", totalAngsuranHarusDibayar);

        // Menambahkan total angsuran masuk ke plafond baru
        let plafondBaru = parseFloat(plafondTerakhir.plafond_saat_ini || 0) + totalAngsuranHarusDibayar;
        console.log("Plafond baru setelah angsuran masuk: ", plafondBaru);

        await PlafondUpdate.update(
            { plafond_saat_ini: plafondBaru },
            { where: { id_pinjaman: plafondTerakhir.id_pinjaman }, transaction }
        );

        console.log("Plafond setelah angsuran masuk: ", plafondBaru);

        let antreans = await AntreanPengajuan.findAll({
            attributes: ['nomor_antrean', 'id_pinjaman'],
            order: [['nomor_antrean', 'ASC']],
        });

        // Simpan data angsuran baru ke tabel Angsuran
        const lastAngsuran = await Angsuran.findAll({
            attributes: [
                "id_pinjaman",
                [ Sequelize.fn("MAX", Sequelize.col("id_angsuran")), "latest_id_angsuran"],
            ],
            // where: { sudah_dihitung: "false" },
            group: ["id_pinjaman"],
            raw: true,
            
        });

        let lastIdNumber = 0;
        const lastRecord = await Angsuran.findOne({ order: [["id_angsuran", "DESC"]] });
        if (lastRecord && lastRecord.id_angsuran) {
            lastIdNumber = lastRecord && lastRecord.id_angsuran ? parseInt(lastRecord.id_angsuran.substring(1), 10) : 0;
        }

        console.log("Last angsuran: ", lastAngsuran);
        const angsuranData = await Angsuran.findAll({
            where: {
                id_angsuran: {
                    [Op.in]: lastAngsuran.map(data => data.latest_id_angsuran)
                },
                belum_dibayar: {
                    [Op.gt]: 0, //operator greater than
                },
                bulan_angsuran: {
                    [Op.lt]: 60, //operator less than
                },
                id_pinjaman: { [Op.notIn]: excludedPinjamanIds }, 
            },
            include: [
                {
                    model: Pinjaman,
                    as: 'AngsuranPinjaman',
                    attributes: ['pinjaman_setelah_pembulatan', 'status_pelunasan', 'jumlah_angsuran', 'jumlah_pinjaman'],
                    where: {
                        status_pelunasan: {
                            [Op.ne]: 'Lunas',
                        },
                    },
                },
            ],
            order: [["id_pinjaman", "ASC"], ["id_angsuran", "DESC"]],
        });

        console.log("Angsuran data: ", angsuranData);

        const result = {};
        angsuranData.forEach((item) => {
        if (!result[item.id_pinjaman]) {
            result[item.id_pinjaman] = item;
        }
        });

        const angsuranDataTerakhir = Object.values(result);


        const angsuranPertama = await Pinjaman.findAll({
            where: {
                status_pelunasan: {
                    [Op.ne]: 'Lunas',
                },
                status_pengajuan: {
                    [Op.notIn]: ['Ditunda', 'Dibatalkan'],
                },
                status_transfer: {
                    [Op.notIn]: ['Belum Ditransfer', 'Dibatalkan'],
                },
            },
            attributes: ['id_pinjaman', 'jumlah_angsuran', 'pinjaman_setelah_pembulatan', 'id_peminjam', 'jumlah_pinjaman'],
        });

        console.log("Angsuran pertama: ", angsuranPertama);


        for (const item of angsuranPertama) {
            const existingAngsuranPertama = await Angsuran.findOne({
                where: { id_pinjaman: item.id_pinjaman, bulan_angsuran: 1},
            });

            if (!existingAngsuranPertama) {
                lastIdNumber++;
                const newId = `A${lastIdNumber.toString().padStart(5, "0")}`;

                const jumlahAngsuran = item.jumlah_angsuran;
                const belumDibayar = parseFloat((item.pinjaman_setelah_pembulatan - jumlahAngsuran).toFixed(2));
                const statusBaru = belumDibayar <= 0 ? "Lunas" : "Belum Lunas";

                await Angsuran.create({
                    id_angsuran: newId,
                    tanggal_angsuran: formattedToday,
                    sudah_dibayar: jumlahAngsuran,
                    belum_dibayar: Math.max(0, belumDibayar),
                    bulan_angsuran: 1,
                    sudah_dihitung: false,
                    status: statusBaru,
                    id_peminjam: item.id_peminjam,
                    id_pinjaman: item.id_pinjaman,
                });

                if (statusBaru === "Lunas") {
                    await Pinjaman.update(
                        { status_pelunasan: "Lunas" },
                        { where: { id_pinjaman: item.id_pinjaman } }
                    );
                }
            }
        }

        // Jika ada antrean, lanjut proses antrean
        if (antreans.length > 0) {
            const antreanData = await Pinjaman.findAll({
                where: {
                    id_pinjaman: {
                        [Op.in]: antreans.map((antrean) => antrean.id_pinjaman),
                    },
                },
                attributes: ["id_pinjaman", "jumlah_pinjaman"],
                transaction,
            });

            const pinjamanMap = new Map(antreanData.map((item) => [item.id_pinjaman, item.jumlah_pinjaman]));

            let plafondSaatIni = plafondBaru;


            for (let i = 0; i < antreans.length; i++) {
                const antrean = antreans[i];
                const jumlahPinjamanAntrean = pinjamanMap.get(antrean.id_pinjaman) || 0;

                plafondSaatIni = parseFloat((plafondSaatIni - jumlahPinjamanAntrean).toFixed(2));

                if (plafondSaatIni > 0) {
                    let tanggalPlafondTersedia = new Date();
                    await PlafondUpdate.update(
                        {
                            plafond_saat_ini: plafondSaatIni,
                            tanggal_plafond_tersedia: tanggalPlafondTersedia,
                        },
                        { where: { id_pinjaman: antrean.id_pinjaman }, transaction }
                    );
                } else if (plafondSaatIni < jumlahPinjamanAntrean) {
                    const nextMonthDate = new Date();
                    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

                    let bulanTambahan = Math.abs(Math.floor(plafondSaatIni / totalAngsuranHarusDibayar));
                    let tanggalPlafondTersedia = new Date();
                    tanggalPlafondTersedia.setMonth(tanggalPlafondTersedia.getMonth() + bulanTambahan);
                    tanggalPlafondTersedia.setDate(1);

                    await PlafondUpdate.update(
                        {
                            plafond_saat_ini: plafondSaatIni,
                            tanggal_plafond_tersedia: tanggalPlafondTersedia,
                        },
                        { where: { id_pinjaman: antrean.id_pinjaman }, transaction }
                    );
                }
            }
        }

        //otomatisasi angsuran jika Angsuran != null
        for (const item of angsuranDataTerakhir) {

            lastIdNumber++;
            const newId = `A${lastIdNumber.toString().padStart(5, "0")}`;

                const jumlahAngsuran = item.AngsuranPinjaman.jumlah_angsuran;

                const belumDibayar = parseFloat((item.belum_dibayar - jumlahAngsuran).toFixed(2));
                const statusBaru = belumDibayar <= 0 ? 'Lunas' : 'Belum Lunas';
                const peminjam = item.id_peminjam;

                await Angsuran.create({
                    id_angsuran: newId,
                    tanggal_angsuran: formattedToday,
                    sudah_dibayar: jumlahAngsuran,
                    belum_dibayar: Math.max(0, belumDibayar),
                    bulan_angsuran: item.bulan_angsuran + 1,
                    status: statusBaru,
                    sudah_dihitung: false,
                    id_peminjam: peminjam,
                    id_pinjaman: item.id_pinjaman,
                });

                if (statusBaru === 'Lunas') {
                    await Pinjaman.update(
                        { status_pelunasan: 'Lunas' },
                        { where: { id_pinjaman: item.id_pinjaman } }
                    );
                }
                
                let antreans = await AntreanPengajuan.findAll({
                    attributes: ['nomor_antrean', 'id_pinjaman'],
                    order: [['nomor_antrean', 'ASC']],
                });
        
                if (antreans.length > 0) {
                    let plafondSaatIni = plafondBaru;
        
                    for (let i = 0; i < antreans.length; i++) {
                        const antrean = antreans[i];
                        const jumlahPinjamanAntrean = await Pinjaman.findOne({
                            where: { id_pinjaman: antrean.id_pinjaman },
                            attributes: ["jumlah_pinjaman"],
                            raw: true,
                            transaction
                        });
        
                        plafondSaatIni -= jumlahPinjamanAntrean.jumlah_pinjaman;
        
                        let tanggalPlafondTersedia = new Date();
                        if (plafondSaatIni < jumlahPinjamanAntrean.jumlah_pinjaman) {
                            tanggalPlafondTersedia.setMonth(tanggalPlafondTersedia.getMonth() + 1);
                        }
        
                        await PlafondUpdate.update(
                            { tanggal_plafond_tersedia: tanggalPlafondTersedia },
                            { where: { id_pinjaman: antrean.id_pinjaman }, transaction }
                        );
                    }
                }
        }

        await transaction.commit();
        console.log("Update angsuran otomatis selesai.");

        await Angsuran.update(
            { sudah_dihitung: true },
            { where: { sudah_dihitung: false } },
        );
    } catch (error) {
        await transaction.rollback();
        console.error("Terjadi kesalahan: ", error);
    }
};


export default updateAngsuranOtomatis;