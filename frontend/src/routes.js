import Beranda from "views/Beranda.js";
import ScreeningKaryawan from "views/ScreeningKaryawan.js";
import Angsuran from "views/Angsuran.js";
import LaporanPiutang from "views/LaporanPiutangKaryawan.js";
import Plafond from "views/Plafond.js";
import MasterKaryawan from "views/MasterKaryawan.js";
import ScreeningKaryawanManual from "views/ScreeningKaryawanManual.js";
import BerandaFinance from "views/BerandaFinance.js";
import BerandaKaryawan from "views/BerandaKaryawan.js";
import ScreeningPinjamanKaryawan from "views/ScreeningPinjamanKaryawan.js";
import ScreeningPinjamanKaryawan2 from "views/ScreeningPinjamanKaryawan2.js";
import RiwayatPengajuanKaryawan from "views/RiwayatPengajuanKaryawan.js";
import AngsuranKaryawan from "views/AngsuranKaryawan.js";
import MasterUser from "views/MasterUser.js";
import DashboardKaryawan from "views/DashboardKaryawan.js";
import RiwayatPinjamanKaryawan from "views/RiwayatPinjamanKaryawan";
import AngsuranFinance from "views/AngsuranFinance";

import Login from "views/Login.js";

const dashboardRoutes = [
  {
    path: "/beranda",
    name: "Beranda",
    icon: "nc-icon nc-chart-pie-35",
    component: Beranda,
    layout: "/admin"
  },
  {
    path: "/screening-karyawan-manual",
    name: "Screening Manual",
    icon: "nc-icon nc-circle-09",
    component: ScreeningKaryawanManual,
    layout: "/admin"
  },
  {
    path: "/angsuran",
    name: "Angsuran",
    icon: "nc-icon nc-notes",
    component: Angsuran,
    layout: "/admin"
  },
  {
    path: "/laporan-piutang-karyawan",
    name: "Laporan Piutang",
    icon: "nc-icon nc-paper-2",
    component: LaporanPiutang,
    layout: "/admin"
  },
  {
    path: "/plafond",
    name: "Plafond",
    icon: "nc-icon nc-money-coins",
    component: Plafond,
    layout: "/admin"
  },
  {
    path: "/master-karyawan",
    name: "Master Karyawan",
    icon: "nc-icon nc-single-02",
    component: MasterKaryawan,
    layout: "/admin"
  },


  //LOGIN PAGE
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-single-02",
    component: Login,
    layout: "/"
  },


  //FINANCE 
  {
    path: "/beranda-finance",
    name: "Beranda",
    icon: "nc-icon nc-single-02",
    component: BerandaFinance,
    layout: "/finance"
  },
  {
    path: "/angsuran-finance",
    name: "Angsuran",
    icon: "nc-icon nc-notes",
    component: AngsuranFinance,
    layout: "/finance"
  },
  {
    path: "/laporan-piutang-karyawan",
    name: "Laporan Piutang",
    icon: "nc-icon nc-paper-2",
    component: LaporanPiutang,
    layout: "/finance"
  },

  //KARYAWAN
  {
    path: "/dashboard-karyawan2",
    name: "Beranda",
    icon: "nc-icon nc-chart-pie-35",
    component: DashboardKaryawan,
    layout: "/karyawan"
  },
  // {
  //   path: "/beranda-karyawan",
  //   name: "Beranda",
  //   icon: "nc-icon nc-chart-pie-35",
  //   component: BerandaKaryawan,
  //   layout: "/karyawan"
  // },
  {
    path: "/screening-pinjaman",
    name: "Screening Pinjaman",
    icon: "nc-icon nc-circle-09",
    component: ScreeningPinjamanKaryawan,
    layout: "/karyawan"
  },
  {
    path: "/screening2",
    name: "Screening Pinjaman 2",
    icon: "nc-icon nc-circle-09",
    component: ScreeningPinjamanKaryawan2,
    layout: "/karyawan"
  },
  {
    path: "/riwayat-pengajuan",
    name: "Riwayat Pengajuan",
    icon: "nc-icon nc-paper-2",
    component: RiwayatPengajuanKaryawan,
    layout: "/karyawan"
  },
  {
    path: "/riwayat-pinjaman",
    name: "Riwayat Pinjaman",
    icon: "nc-icon nc-money-coins",
    component: RiwayatPinjamanKaryawan,
    layout: "/karyawan"
  },
  {
    path: "/angsuran-karyawan",
    name: "Angsuran",
    icon: "nc-icon nc-notes",
    component: AngsuranKaryawan,
    layout: "/karyawan"
  },


  // SUPER ADMIN
  {
    path: "/master-user",
    name: "Master User",
    icon: "nc-icon nc-single-02",
    component: MasterUser,
    layout: "/super-admin"
  },



  {
    path: "/screening-karyawan",
    name: "Screening Karyawan",
    icon: "nc-icon nc-circle-09",
    component: ScreeningKaryawan,
    layout: "/admin"
  },
  
];

export default dashboardRoutes;
