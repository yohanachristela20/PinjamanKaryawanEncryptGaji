import React, { useState, useEffect } from "react";
import {FaFilePdf, FaSave, FaUpload} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Heartbeat from "./Heartbeat.js";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";

import {
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Spinner
} from "react-bootstrap";


function AngsuranKaryawan() {
  const [showImportModal, setShowImportModal] = useState(false); 
  const [karyawanData, setKaryawanData] = useState([]); 
  const [angsuranList, setAngsuranList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hidden, setHidden] = useState(false); 
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: "", role: ""}); 

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const filteredAngsuranFinal = karyawanData
  .filter((item) => item.id_peminjam === userData.id_karyawan)
  .filter((angsuran) =>
    (angsuran.id_angsuran && String(angsuran.id_angsuran).toLowerCase().includes(searchQuery)) ||
    (angsuran.tanggal_angsuran && String(angsuran.tanggal_angsuran).toLowerCase().includes(searchQuery)) ||
    (angsuran.id_pinjaman && String(angsuran.id_pinjaman).toLowerCase().includes(searchQuery)) 
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAngsuranFinal.slice(indexOfFirstItem, indexOfLastItem); 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    // console.log("User token: ", token, "User role:", role);
    try {
      if (!token || !username) return;

      const response = await axios.get(`http://10.70.10.157:5000/user-details/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setUserData({
          id_karyawan: response.data.id_karyawan,
          nama: response.data.nama,
          divisi: response.data.divisi,
          role: response.data.role, 
        });
        // console.log("User data fetched:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getAngsuran = async () => {
    try {
      const response = await axios.get('http://10.70.10.157:5000/angsuran', {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setAngsuranList(response.data);
    } catch (error) {
      console.error('Gagal mendapatkan data angsuran:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const scheduleNextCheck = () => {
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(0, 0, 0, 0); 
    nextCheck.setDate(nextCheck.getDate() + 1); // Penjadwalan untuk hari berikutnya

    const timeUntilNextCheck = nextCheck - now;

    setTimeout(() => {
      scheduleNextCheck(); // Jadwalkan ulang untuk hari berikutnya
    }, timeUntilNextCheck);
  };

  useEffect(() => {
    fetchUserData();
    getAngsuran();
    getKaryawanData();
    scheduleNextCheck(); 
    return () => clearTimeout(); 

  }, []);

  useEffect(() => {
    setHidden(userData.role === "Finance");
  }, [userData]);


  useEffect(() => {
    if (angsuranList.length > 0) {
      const angsuran = angsuranList[0]; 
      setSisaAngsuranBulan(60 - angsuran.bulan_angsuran);
    }
  }, [angsuranList]);


  const getKaryawanData = async () => {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage
  
    try {
      const response = await axios.get("http://10.70.10.157:5000/karyawan-data", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      setKaryawanData(response.data); 
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Unauthorized: Token is invalid or expired.");
      } else {
        console.error("Error fetching data:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  const formatRupiah = (angka) => {
    let angsuranString = angka.toString().replace(".00");
    let sisa = angsuranString.length % 3;
    let rupiah = angsuranString.substr(0, sisa);
    let ribuan = angsuranString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
  };

  const [sisaAngsuranBulan, setSisaAngsuranBulan] = useState(0);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };
  
const downloadPDF = (data) => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(12); 
  doc.text("Laporan Angsuran Pinjaman", 12, 20);
  
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
  doc.text(`${userData.id_karyawan} - ${userData.nama}`, 12, 40);

  const headers = [
    "ID Angsuran", 
    "Tanggal Angsuran",
    "ID Pinjaman", 
    "Sudah Dibayar", 
    "Belum Dibayar", 
    "Angsuran ke- (Bulan)", 
    "Keterangan"
  ];  
  // Format Data untuk Tabel
  const rows = Array.from(document.querySelectorAll("tbody tr")).map((tr) => {
    return Array.from(tr.querySelectorAll("td")).map((td) => td.innerText.trim());
  });

  const marginTop = 25; 

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
    },
    tableWidth: 'auto',

  });

  doc.save("laporan angsuran.pdf");
};


  return (
    <>
      <Container fluid>
      <ToastContainer />
      <Heartbeat/>
        <Row>
          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={downloadPDF}>
            <FaFilePdf style={{ marginRight: '8px' }} />
            Unduh PDF
          </Button>

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          
          <Col md="12">
            <Card className="striped-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Angsuran Pinjaman</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                 {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p>Loading...</p>
                    </div>
                  ) : (
                <Table className="table-hover table-striped">
                  <div className="table-scroll" style={{ height: 'auto' }}>
                    <table className="flex-table table table-striped table-hover">
                      <thead>
                      <tr>
                        <th>ID Angsuran</th>
                        <th className="border-0">Tanggal Angsuran</th>
                        <th className="border-0">ID Pinjaman</th>
                        <th className="border-0">Sudah Dibayar</th>
                        <th className="border-0">Belum Dibayar</th>
                        <th className="border-0">Angsuran ke- (Bulan)</th>
                        <th className="border-0">Keterangan</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        { currentItems.map((angsuran) => (
                          <tr key={angsuran.id_angsuran}>
                            <td className="text-center">{angsuran.id_angsuran}</td>
                            <td className="text-center">{angsuran.tanggal_angsuran}</td>
                            <td className="text-center">{angsuran.id_pinjaman}</td>
                            <td className="text-right">{formatRupiah(angsuran.sudah_dibayar)}</td>
                            <td className="text-right">{formatRupiah(angsuran.belum_dibayar)}</td>
                            <td className="text-right">{angsuran.bulan_angsuran}</td>

                            <td className="text-center">{angsuran.keterangan}</td>
                          </tr>
                        ))}
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
                  totalItemsCount={filteredAngsuranFinal.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  itemClass="page-item"
                  linkClass="page-link"
            />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default AngsuranKaryawan;
