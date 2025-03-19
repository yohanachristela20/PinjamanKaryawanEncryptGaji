import React, { useState, useEffect } from "react";
import { FaFileCsv, FaFileImport, FaFilePdf} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import Pelunasan from "components/ModalForm/Pelunasan.js";
import ImportAngsuran from "components/ModalForm/ImportAngsuran.js";
import { toast } from 'react-toastify';
import jsPDF from "jspdf";
import "jspdf-autotable";
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

function AngsuranFinance() {
  const [showPelunasanModal, setShowPelunasanModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [selectedAngsuran, setSelectedAngsuran] = useState(null); 
  const [karyawanData, setKaryawanData] = useState([]); 
  const [angsuranList, setAngsuranList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hidden, setHidden] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const filteredAngsuran = karyawanData.filter((angsuran) =>
    (angsuran.id_angsuran && String(angsuran.id_angsuran).toLowerCase().includes(searchQuery)) ||
    (angsuran.tanggal_angsuran && String(angsuran.tanggal_angsuran).toLowerCase().includes(searchQuery)) ||
    (angsuran.id_peminjam && String(angsuran.id_peminjam).toLowerCase().includes(searchQuery)) ||
    (angsuran?.KaryawanPeminjam?.nama && String(angsuran.KaryawanPeminjam.nama).toLowerCase().includes(searchQuery)) ||
    // (pinjaman?.Peminjam?.nama && String(pinjaman.Peminjam.nama).toLowerCase().includes(searchQuery)) ||
    (angsuran.id_pinjaman && String(angsuran.id_pinjaman).toLowerCase().includes(searchQuery)) ||
    (angsuran.status && String(angsuran.status).toLowerCase().includes(searchQuery))
  );

  const sortedAngsuran = filteredAngsuran.sort((a, b) => {
    const aNumeric = parseInt(a.id_angsuran.replace(/[^\d]/g, ''), 10);
    const bNumeric = parseInt(b.id_angsuran.replace(/[^\d]/g, ''), 10);
    return bNumeric - aNumeric;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAngsuran.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: "", role: ""}); 

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

    useEffect(() => {
      fetchUserData();
      getAngsuran();
      getKaryawanData();
      updateAngsuran();
    }, []);
  
  
    const getAngsuran = async () => {
      try {
        setLoading(true);
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
  
    const updateAngsuran = async () => {
      const today = new Date();
      if (today.getDate() !== 1) {
        setLoading(false);
        toast.info("Update angsuran otomatis hanya dapat dilakukan pada tanggal 1.");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.put(
          `http://10.70.10.157:5000/status-update`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.alreadyUpdated) {
          toast.error("Angsuran sudah diperbarui bulan ini, tidak perlu memperbarui lagi.");
        } else {
          // console.log("Angsuran berhasil diperbarui:", response.data);
          toast.success("Angsuran otomatis diperbarui!");
          getAngsuran();
        }
      } catch (error) {
        console.error("Gagal memperbarui angsuran otomatis:", error.message);
      } finally {
        setLoading(false);
      }
    };
      
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
        setLoading(true);
        const response = await axios.get("http://10.70.10.157:5000/karyawan-data", {
          headers: {
            Authorization: `Bearer ${token}`, // Kirim token dalam header Authorization
          },
        });
        setKaryawanData(response.data); // Set data ke state
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
  
  const handlePelunasanSuccess = () => {
    getKaryawanData();
    toast.success("Data pelunasan berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }
  
  const handleImportSuccess = () => {
    getAngsuran();
    getKaryawanData();
    toast.success("Angsuran berhasil diimport!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

const downloadCSV = (data) => {
  const header = ["id_angsuran", "tanggal_angsuran", "id_peminjam", "id_pinjaman", "sudah_dibayar", "belum_dibayar", "bulan_angsuran", "keterangan"];
  const rows = data.map((item) => [
    item.id_angsuran,
    item.tanggal_angsuran,
    item.id_peminjam,
    item.id_pinjaman,
    item.sudah_dibayar,
    item.belum_dibayar,
    item.bulan_angsuran,
    item.keterangan
  ]);

  const csvContent = [header, ...rows]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "angsuran.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

  const headers = [
    "ID Angsuran", 
    "Tanggal Angsuran",
    "ID Karyawan",  
    "Nama Karyawan", 
    "ID Pinjaman", 
    "Dibayar", 
    "Belum Dibayar", 
    "Angsuran ke- (Bulan)", 
    "Keterangan"
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
    },
    tableWidth: 'auto',

  });

  doc.save("laporan angsuran.pdf");
};


  return (
    <>
      <Container fluid>
      {/* <ToastContainer /> */}
      {/* <UpdateStatusChecker /> */}
        <Row>
        <div>         
          <Pelunasan
            showPelunasanModal={showPelunasanModal}
            setShowPelunasanModal={setShowPelunasanModal}
            angsuran={selectedAngsuran}
            onSuccess={handlePelunasanSuccess}
          />
        </div>
        <div>
            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="info"
              onClick={handleImportButtonClick}
              hidden={role === "Finance"}
            >
              <FaFileImport style={{ marginRight: "8px" }} />
              Import Data
            </Button>
        </div>

          <ImportAngsuran showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadCSV(angsuranList)}>
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
          
          <Col md="12">
            <Card className="striped-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Angsuran Pinjaman</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0 " style={{ overflowX: 'auto' }}>
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
                        <th className="border-0 text-wrap">ID Angsuran</th>
                        <th className="border-0 text-wrap">Tanggal Angsuran</th>
                        <th className="border-0 text-wrap">ID Karyawan</th>
                        <th className="border-0 text-wrap">Nama Karyawan</th>
                        <th className="border-0 text-wrap">ID Pinjaman</th>
                        <th className="border-0 text-wrap">Dibayar</th>
                        <th className="border-0 text-wrap">Belum Dibayar</th>
                        <th className="border-0 text-wrap">Angsuran ke- (Bulan)</th>
                        <th className="border-0 text-wrap">Keterangan</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        {currentItems && currentItems.length > 0? (
                            currentItems
                            .map((angsuran) => (
                            <tr key={angsuran.id_angsuran}>
                              <td className="text-center">{angsuran.id_angsuran}</td>
                              <td className="text-center">{angsuran.tanggal_angsuran}</td>
                              <td className="text-center">{angsuran.id_peminjam}</td>
                              <td className="text-center">{angsuran.KaryawanPeminjam && angsuran.KaryawanPeminjam.nama ? angsuran.KaryawanPeminjam.nama : 'N/A'}</td>
                              <td className="text-center">{angsuran.id_pinjaman}</td>
                              <td className="text-right">{formatRupiah(angsuran.sudah_dibayar)}</td>
                              <td className="text-right">{formatRupiah(angsuran.belum_dibayar)}</td>
                              <td className="text-center">{angsuran.bulan_angsuran}</td>
                              <td className="text-center">{angsuran.keterangan}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            
                            <td colSpan={10} className="text-center">
                            <Spinner animation="border" variant="primary" />
                              Loading...
                            </td>
                          </tr>
                        )}
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
                  totalItemsCount={filteredAngsuran.length}
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

export default AngsuranFinance;
