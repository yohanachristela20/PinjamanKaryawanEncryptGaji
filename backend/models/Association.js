import Pinjaman from "./PinjamanModel.js";
import Karyawan from "./KaryawanModel.js";
import AntreanPengajuan from "./AntreanPengajuanModel.js";
import Angsuran from "./AngsuranModel.js";
import User from "./UserModel.js";
import PlafondUpdate from "./PlafondUpdateModel.js";

Pinjaman.belongsTo(Karyawan, { foreignKey: 'id_peminjam', as: 'Peminjam' });
Pinjaman.belongsTo(Karyawan, { foreignKey: 'id_asesor', as: 'Asesor' });
AntreanPengajuan.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'AntreanPinjaman'});
Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'AngsuranPinjaman'});
Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'SudahDibayar'});
Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'BelumDibayar'});
Angsuran.belongsTo(Karyawan, {foreignKey: 'id_peminjam', as: 'KaryawanPeminjam'}); 
User.belongsTo(Karyawan, { foreignKey: 'username', as: 'Username' });
PlafondUpdate.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'UpdatePinjamanPlafond'});


Karyawan.hasMany(Pinjaman, { foreignKey: 'id_peminjam', as: 'Peminjam' });
Karyawan.hasMany(Pinjaman, { foreignKey: 'id_asesor', as: 'Asesor' });
Pinjaman.hasOne(AntreanPengajuan, {foreignKey: 'id_pinjaman', as: 'AntreanPinjaman'});
Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'AngsuranPinjaman'});
Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'SudahDibayar'});
Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'BelumDibayar'});
Karyawan.hasMany(Angsuran, {foreignKey: 'id_peminjam', as: 'KaryawanPeminjam'}); 
Karyawan.hasMany(User, { foreignKey: 'username', as:'Username'});
// Pinjaman.hasMany(Angsuran, {foreignKey:'id_peminjam', as:'KaryawanPeminjam'});
Pinjaman.hasOne(PlafondUpdate, {foreignKey: 'id_pinjaman', as: 'UpdatePinjamanPlafond'});  
