import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFilePdf, FaCheckSquare} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import ImportAntreanPengajuan from "components/ModalForm/ImportAntreanPengajuan.js";
import ChartComponent from "components/Chart/BarChart.js";
import LineComponent from "components/Chart/LineChart";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom"; 
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import 'chartist-plugin-tooltips';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css'; 
import 'chartist/dist/chartist.min.css'; 
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import cardBeranda from "../assets/img/beranda3.png";
import "../assets/scss/lbd/_table-header.scss";


// import {Link} from "react-router-dom"; 

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Modal, 
  Spinner
} from "react-bootstrap";

// ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

function BerandaFinance() {
  const [pinjaman, setPinjaman] = useState([]); 
  const [pinjamanData, setPinjamanData] = useState([]); 
  const [antrean, setAntrean] = useState([]); 
  const [selectedPinjaman, setSelectedPinjaman] = useState(null);
  const history = useHistory(); 
  const [error, setError] = useState("");
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [totalDibayar, setTotalDibayar] = useState(0);
  const [totalPeminjam, setTotalPeminjam] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportModal, setShowImportModal] = useState(false); 
  const [years, setYears] = useState([]); // Menyimpan daftar tahun yang tersedia
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDepartemen, setSelectedDepartemen] = useState("");
  const [chartDataTahunan, setChartDataTahunan] = useState({ labels: [], series: [[]] });
  const [chartDataBulanan, setChartDataBulanan] = useState({ labels: [], series: [[]] });

  const [latestPlafond, setLatestPlafond] = useState("");

  const [showModal, setShowModal] = useState(false); 
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const findNomorAntrean = (idPinjaman) => {
    const antreanItem = antrean.find(item => item.id_pinjaman === idPinjaman);
    return antreanItem ? antreanItem.nomor_antrean : "-"; // Menampilkan nomor antrean jika ada, jika tidak "-".
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredAndSortedPinjaman = pinjaman 
  .filter(
    (pinjaman) =>
      (pinjaman.id_pinjaman && String(pinjaman.id_pinjaman).toLowerCase().includes(searchQuery)) ||
      (pinjaman.tanggal_pengajuan && String(pinjaman.tanggal_pengajuan).toLowerCase().includes(searchQuery)) ||
      (pinjaman.nomor_antrean && pinjaman.nomor_antrean.toLowerCase().includes(searchQuery)) ||
      (pinjaman.id_peminjam && String(pinjaman.id_peminjam).toLowerCase().includes(searchQuery)) ||
      (pinjaman?.Peminjam?.nama && String(pinjaman.Peminjam.nama).toLowerCase().includes(searchQuery)) ||
      (pinjaman.keperluan && String(pinjaman.keperluan).toLowerCase().includes(searchQuery)) ||
      (pinjaman.status_pengajuan && String(pinjaman.status_pengajuan).toLowerCase().includes(searchQuery))
  ) 
  .filter(
    (item) => 
      item.status_transfer !== "Selesai" &&
      item.status_pengajuan !== "Dibatalkan" && 
      item.status_transfer !== "Dibatalkan"
  )
  .map((pinjaman) => ({
    ...pinjaman,
    nomor_antrean: findNomorAntrean(pinjaman.id_pinjaman),
  }))
  .sort((a, b) => a.nomor_antrean - b.nomor_antrean);

  const currentItems = filteredAndSortedPinjaman.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    getAntrean();
    getPinjaman();
    getPinjamanData();
    fetchAntrean(); 
    
  }, []);

  const fetchAntrean = async () => {
    try {
      const response = await axios.get("http://10.70.10.157:5000/antrean-pengajuan", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setAntrean(response.data);
    } catch (error) {
      console.error("Error fetching antrean:", error.message);
    }
  };

  const getMonths = () => {
    return [
      { value: "01", label: "Januari" },
      { value: "02", label: "Februari" },
      { value: "03", label: "Maret" },
      { value: "04", label: "April" },
      { value: "05", label: "Mei" },
      { value: "06", label: "Juni" },
      { value: "07", label: "Juli" },
      { value: "08", label: "Agustus" },
      { value: "09", label: "September" },
      { value: "10", label: "Oktober" },
      { value: "11", label: "November" },
      { value: "12", label: "Desember" },
    ];
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get("http://10.70.10.157:5000/filter-piutang", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = response.data;
        const uniqueYears = [
          ...new Set(data.map((item) => new Date(item.tanggal_pengajuan).getFullYear())),
        ];
        setYears(uniqueYears.sort()); // Simpan tahun secara terurut
      } catch (error) {
        console.error("Error fetching years:", error.message);
      }
    };
  
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if (!token || !username) return;
  
      try {
        const response = await axios.get(
          `http://10.70.10.157:5000/user-details/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (response.data) {
          setUserData({
            id_karyawan: response.data.id_karyawan,
            nama: response.data.nama,
            divisi: response.data.divisi,
          });
          // console.log("User data fetched:", response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    const fetchSummaryData = async () => {
      try {
        const [responseTotalPinjaman, responseTotalPeminjam, responseTotalDibayar, responsePlafond] = await Promise.all([
          axios.get("http://10.70.10.157:5000/total-pinjaman-keseluruhan", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://10.70.10.157:5000/total-peminjam", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://10.70.10.157:5000/total-dibayar", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://10.70.10.157:5000/latest-plafond-saat-ini", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        setTotalPinjamanKeseluruhan(responseTotalPinjaman.data.totalPinjamanKeseluruhan || 0);
        setTotalPeminjam(responseTotalPeminjam.data.totalPeminjam || 0);
        setTotalDibayar(responseTotalDibayar.data.total_dibayar || 0);
        setLatestPlafond(responsePlafond.data.latestPlafond || 0);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };
  
    fetchYears();
    fetchUserData();
    fetchSummaryData();
  
    // Panggil dataPinjaman dengan selectedYear
    dataPinjaman(selectedYear);
    dataPerDivisi("");
  }, [selectedYear]); // Dependency array untuk memantau perubahan pada selectedYear

  const data_plafond = {
    labels: ['Digunakan', 'Tersedia'],
    datasets: [
      {
        label: 'Pinjaman Overview',
        data: [
          totalPinjamanKeseluruhan,
          latestPlafond,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverOffset: 4
      }
    ]
  };

  // console.log("Plafond saat ini: ", latestPlafond);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const getPinjaman = async () =>{
    try {
      setLoading(true);
      const response = await axios.get("http://10.70.10.157:5000/pinjaman", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setPinjaman(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  const getPinjamanData = async () =>{
    try {
      setLoading(true);
      const response = await axios.get("http://10.70.10.157:5000/pinjaman-data", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setPinjamanData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  
  const getAntrean = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://10.70.10.157:5000/antrean-pengajuan", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setAntrean(response.data); 
    } catch (error) {
      console.error("Error fetching antrean:", error.message);
      setError("Gagal mengambil antrean. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };


  const formatRupiah = (angka) => {
    let pinjamanString = angka.toString().replace(".00");
    let sisa = pinjamanString.length % 3;
    let rupiah = pinjamanString.substr(0, sisa);
    let ribuan = pinjamanString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
};


  const handleModalOpen = (pinjaman) => {
    setSelectedPinjaman(pinjaman); 
    setShowModal(true); 
  };

  const handleTerimaClick = async (pinjaman) => {
    // console.log("Isi userData:", userData);

    if (!userData || !userData.id_karyawan) {
      console.error("ID Asesor tidak ditemukan. Pastikan userData diinisialisasi dengan benar.");
      toast.error("ID Asesor tidak ditemukan. Silakan coba lagi.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      return;
    }


    try {
      // console.log('Mencoba mengupdate status transfer:', pinjaman);
  
      const payload = {
        status_pengajuan: pinjaman.status_pengajuan,
        status_transfer: "Selesai",
        id_asesor: userData.id_karyawan,
      };

      // console.log("Payload yang dikirim ke server:", payload);

      // Update status_pengajuan
      // console.log("ID Pinjaman:", pinjaman.id_pinjaman);
      const response = await axios.put(`http://10.70.10.157:5000/pinjaman/${pinjaman.id_pinjaman}`, {
        status_pengajuan: pinjaman.status_pengajuan,
        status_transfer: "Selesai", 
        id_asesor: userData.id_karyawan, 
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
  
      // console.log('Status transfer berhasil diperbarui:', response.data);
  
      setShowModal(false);
    
      toast.success('Status pengajuan berhasil diperbarui!', {
        position: "top-right", 
        autoClose: 5000,
        hideProgressBar: true,
      });

      window.location.reload();
      getPinjaman(); 
      getPinjamanData();
      
      
  
    } catch (error) {
      console.error('Error updating status_pengajuan:', error.response ? error.response.data : error.message);
      toast.error('Gagal memperbarui status pengajuan.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  };
  
  const handleImportSuccess = () => {
    getPinjaman();
    getAntrean();
    toast.success("Antrean Pengajuan berhasil diimport!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };
  

  const downloadCSV = (data) => {
    const header = ["id_pinjaman", "tanggal_pengajuan", "nomor_antrean", "jumlah_pinjaman", "jumlah_angsuran", "pinjaman_setelah_pembulatan", "keperluan", "status_pengajuan", "status_transfer", "id_peminjam", "id_asesor"];
    
    const filteredData = data.filter(
      (item) =>
        item.status_pengajuan === "Ditunda" ||
        item.status_transfer === "Belum Ditransfer"
    );
    
    const rows = filteredData.map((item) => {

      const findNomorAntrean = (idPinjaman) => {
        const antreanItem = antrean.find(item => item.id_pinjaman === idPinjaman);
        return antreanItem ? antreanItem.nomor_antrean : "-"; 
      };

      return [
        item.id_pinjaman,
        item.tanggal_pengajuan,
        findNomorAntrean(item.id_pinjaman),
        item.jumlah_pinjaman,
        item.jumlah_angsuran,
        item.pinjaman_setelah_pembulatan,
        item.keperluan,
        item.status_pengajuan,
        item.status_transfer,
        item.id_peminjam,
        item.id_asesor
      ];
    });

    // console.log("Baris CSV:", rows);
    
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "antrean_pengajuan.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Antrean Pengajuan Pinjaman", 12, 20);
    
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
  
    doc.setFontSize(12); 
    doc.text(`Tanggal cetak: ${formattedDate}`, 12, 30);
  
    const headers = [
      "ID Pinjaman", 
      "Tanggal Pengajuan", 
      "Nomor Antrean", 
      "ID Karyawan", 
      "Nama Lengkap", 
      "Jumlah Pinjaman", 
      "Jumlah Angsuran", 
      "Jumlah Pinjaman Setelah Pembulatan", 
      "Keperluan", 
      "Status Pengajuan", 
      "Status Transfer"
    ];  
    // Format Data untuk Tabel
    const rows = Array.from(document.querySelectorAll("tbody tr")).map((tr) => {
      return Array.from(tr.querySelectorAll("td")).map((td) => td.innerText.trim());
    });

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: [headers],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [3, 177, 252] }, 

      columnStyles: {
        0: { cellWidth: 'auto' },  
        1: { cellWidth: 'auto' }, 
        2: { cellWidth: 'auto' },  
        3: { cellWidth: 'auto' },  
        4: { cellWidth: 'auto' },  
        5: { cellWidth: 'auto' },  
        6: { cellWidth: 'auto' },  
        7: { cellWidth: 'auto' },  
        8: { cellWidth: 'auto' },  
        9: { cellWidth: 'auto' },  
        10: { cellWidth: 'auto' }
      },
      tableWidth: 'auto',
  
    });
  
    doc.save("antrean_pengajuan_pinjaman.pdf");
  };
  
  const dataPinjaman = async (selectedYear) => {
    try {
      const response = await axios.get("http://10.70.10.157:5000/data-pinjaman", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          year: selectedYear, // Kirim tahun sebagai parameter
        },
      });
  
      const data = response.data;
  
      const labels = [];
      const seriesPinjaman = [];
  
      data.forEach((item) => {
        labels.push(item.departemen);
        const jumlahPinjamanScaled = Math.floor(item.jumlah_pinjaman / 1000000);
        seriesPinjaman.push(jumlahPinjamanScaled);
      });
  
      if (labels.length > 0 && seriesPinjaman.length > 0) {
        setChartDataTahunan({
          labels: labels,
          series: [seriesPinjaman],
        });
      } else {
        setChartDataTahunan({
          labels: [],
          series: [[]],
        });
        console.error("Data kosong");
      }
    } catch (error) {
      console.error("Error fetching dataPinjaman:", error.message);
    }
  };

  const dataPerDivisi = async (selectedDepartemen, selectedMonth = "", selectedYear = "") => {
    try {
      const tahun = selectedYear || new Date().getFullYear();
      const bulan = selectedMonth === "" ? undefined : selectedMonth.padStart(2, '0');

      const response = await axios.get("http://10.70.10.157:5000/data-divisi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          departemen: selectedDepartemen || "",
          bulan: bulan,
          tahun: tahun,
        },
      });
  
      const data = response.data;
  
      const labels = [];
      const seriesPinjaman = [];
  
      data.forEach((item) => {
        labels.push(item.divisi);
        const jumlahPinjamanScaled = Math.floor(item.jumlah_pinjaman / 1000000);
        seriesPinjaman.push(jumlahPinjamanScaled);
      });
  
      if (labels.length > 0 && seriesPinjaman.length > 0) {
        setChartDataBulanan({
          labels: labels,
          series: [seriesPinjaman],
        });
      } else {
        setChartDataBulanan({
          labels: [],
          series: [[]],
        });
        console.error("Data kosong");
      }
    } catch (error) {
      console.error("Error fetching dataPerDivisi:", error.message);
      setChartDataBulanan({
        labels: [],
        series: [[]],
      });
    }
  };


  return (
    <>
    {/* <h3 className="mb-5"><center>Selamat Datang Finance di Sistem Pinjaman Karyawan</center></h3> */}

      <div className="home-card">
        <div className="card-content">
          <h2 className="card-title">Hai, {userData.nama}!</h2>
          <h4 className="card-subtitle">Pantau transaksi dan kelola pinjaman dengan sekali klik.</h4><hr/>
          <p className="text-danger">*Sistem akan logout secara otomatis dalam 5 menit jika tidak terdapat aktifitas dalam sistem.</p>
        </div>
        <div className="card-opening">
          <img 
            src={cardBeranda}
            alt="Beranda Illustration"
          /> 
        </div>
      </div>

      <Container fluid>
      {/* <ToastContainer /> */}

      <Row>
          <Col md="12">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Grafik Piutang Tahunan</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <div>
                    <label htmlFor="yearSelect">Pilih Tahun:</label>
                    <select
                      id="yearSelect"
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        dataPinjaman(e.target.value); // Panggil fungsi dataPinjaman
                      }}
                      className="mx-2"
                    >
                      <option value="">Semua Tahun</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ChartComponent chartData={chartDataTahunan} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
        <Col md="8">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Grafik Piutang Bulanan</Card.Title>
            </Card.Header>
            <Card.Body className="mb-5">
              <div className="ct-chart" id="chartHours">
              <div>
                <label htmlFor="yearSelect">Tahun:</label>
                <span className="year-label ml-2" onClick={() => {
                  const currentYear = new Date().getFullYear();
                  setSelectedYear(currentYear);
                  dataPerDivisi(selectedDepartemen, selectedMonth, currentYear);
                }}>
                  {new Date().getFullYear()}
                </span>
              </div>

              <div>
                <label htmlFor="monthSelect">Pilih Bulan:</label>
                <select
                  id="monthSelect"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    dataPerDivisi(selectedDepartemen, e.target.value, selectedYear);
                  }}
                  className="mx-2"
                >
                  <option value="">Semua Bulan</option>
                  {getMonths().map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

                <div>
                  <label htmlFor="departemenSelect">Pilih Departemen:</label>
                  <select
                    id="departemenSelect"
                    value={selectedDepartemen}
                    onChange={(e) => {
                      setSelectedDepartemen(e.target.value);
                      dataPerDivisi(e.target.value); 
                    }}
                    className="mx-2"
                  >
                    <option value="">Semua Departemen</option>
                    <option value="Direksi">Direksi</option>
                    <option value="Finance & Administration">Finance & Administration</option>
                    <option value="Production">Production</option>
                    <option value="Sales & Distribution">Sales & Distribution</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <LineComponent chartData={chartDataBulanan} />
              </div>
            </Card.Body>
          </Card>
        </Col>
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Persentase Ketersediaan Plafond</Card.Title>
              </Card.Header>
              <Card.Body>
              <div style={{ width: '61%', margin: '0 auto' }}>
                <Doughnut data={data_plafond} />
              </div>

                <div className="legend">
                  <i className="fas fa-circle" style={{ color: "#FF6384" }}></i>
                  Tersedia 
                  <i className="fas fa-circle ml-3" style={{ color: "#36A2EB" }}></i>
                  Digunakan 
                </div>
                <hr></hr>
                <p className="card-category">Plafond tersedia saat ini sebesar Rp  {formatRupiah(latestPlafond || 0)}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
        {/* <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="info"
            onClick={handleImportButtonClick}>
            <FaFileImport style={{ marginRight: '8px' }} />
            Import Data
        </Button> */}
        
        <ImportAntreanPengajuan showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

        <Button
          className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
          type="button"
          variant="primary"
          onClick={() => downloadCSV(pinjaman)}>
          <FaFileCsv style={{ marginRight: '8px' }} />
          Unduh CSV
        </Button>
        <Button
          className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
          type="button"
          variant="primary"
          onClick={downloadPDF}>
          <FaFilePdf style={{ marginRight: '8px' }} />
          Unduh PDF
        </Button>
        <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />


        </Row>
          
        <Row>
          <Col md="12">
            <Card className="striped-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Antrean Pengajuan Pinjaman</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                <Table className="table-hover table-striped">
                 <div className="table-scroll" style={{ height:'auto' }}>
                    <table className="flex-table table table-striped table-hover">
                      <thead>
                      <tr>
                        <th className="border-0">ID Pinjaman</th>
                        <th className="border-0">Tanggal Pengajuan</th>
                        <th className="border-0">Nomor Antrean</th>
                        <th className="border-0">ID Karyawan</th>
                        <th className="border-0 center">Nama Lengkap</th>
                        <th className="border-0">Jumlah Pinjaman</th>
                        <th className="border-0">Jumlah Angsuran</th>
                        <th className="border-0">Jumlah Pinjaman Setelah Pembulatan</th>
                        <th className="border-0">Keperluan</th>
                        <th className="border-0">Status Pengajuan</th>
                        <th className="border-0">Status Transfer</th>
                        <th className="border-0">Aksi</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        { currentItems
                        .map((pinjaman) => (
                          <tr key={pinjaman.id_pinjaman}>
                            <td className="text-center">{pinjaman.id_pinjaman}</td>
                            <td className="text-center">{pinjaman.tanggal_pengajuan}</td>
                            <td className="text-right">{findNomorAntrean(pinjaman.id_pinjaman)}</td>
                            <td className="text-right">{pinjaman.id_peminjam}</td>
                            <td className="text-center">{pinjaman?.Peminjam?.nama || 'N/A'}</td>
                            <td className="text-right">{formatRupiah(pinjaman.jumlah_pinjaman)}</td>
                            <td className="text-right">{formatRupiah(pinjaman.jumlah_angsuran)}</td>
                            <td className="text-right">{formatRupiah(pinjaman.pinjaman_setelah_pembulatan)}</td>
                            <td className="text-center">{pinjaman.keperluan}</td>
                            <td className="text-center">
                              {pinjaman.status_pengajuan === "Diterima" ? (
                                <Badge pill bg="success p-2">
                                Diterima
                                </Badge >
                              ) : (
                                <Badge pill bg="secondary p-2">
                                Ditunda
                                </Badge >
                              )}
                              
                            </td>
                            <td className="text-center">
                              {pinjaman.status_transfer === "Selesai" ? (
                                <Badge pill bg="success p-2">
                                Selesai
                                </Badge >
                              ) : (
                                <Badge pill bg="secondary p-2">
                                Belum Ditransfer
                                </Badge >
                              )}
                            </td>
                            <td className="text-center">
                            <Button
                              className="btn-fill pull-right mb-2"
                              type="button"
                              variant="info"
                              onClick={() => {
                                // e.preventDefault();
                                // handleLogout(); 
                                handleModalOpen(pinjaman); 
                              }}
                              disabled={pinjaman.status_pengajuan === "Ditunda"}
                              style={{width: 107, fontSize:14}}>
                              <FaCheckSquare style={{ marginRight: '8px' }} />
                              Terima
                            </Button>
                            </td>
                          </tr>
                        ))
                        }
                      </tbody>
                    </table>
                 </div>
                </Table>
                )}
              </Card.Body>
            </Card>
            <div className="pagination-container">
            <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={filteredAndSortedPinjaman.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  itemClass="page-item"
                  linkClass="page-link"
            />
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header>
        <Modal.Title>Transfer Pinjaman Karyawan</Modal.Title>
          <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => setShowModal(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          &times; {/* Simbol 'x' */}
        </button>
      </Modal.Header>
      <Modal.Body >
        <p>{userData.divisi || "Loading..."} : {userData.id_karyawan} - {userData.nama}</p>
        <p>
            ID Pinjaman: {selectedPinjaman?.id_pinjaman || "Tidak tersedia"} <br />
            Jumlah: {selectedPinjaman? formatRupiah(selectedPinjaman.jumlah_pinjaman) : "Tidak tersedia"}
          </p>
        Apakah anda ingin melakukan transfer sekarang?
      </Modal.Body>
      <Modal.Footer className="mb-4">
        <Button variant="success"  onClick={() => handleTerimaClick(selectedPinjaman)}>
          Ya
        </Button>
        <Button variant="danger" onClick={() => setShowModal(false)}>
          Tidak
        </Button>
      </Modal.Footer>
      </Modal>
    </>
  );
}

export default BerandaFinance;
