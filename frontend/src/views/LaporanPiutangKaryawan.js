import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFilePdf, FaFileImport} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import ImportAntreanPengajuan from "components/ModalForm/ImportAntreanPengajuan.js";
import {toast } from 'react-toastify';

import {
  Badge,
  Button,
  Card,
  Container,
  Row,
  Col,
  Table, 
  Spinner
} from "react-bootstrap";

 function LaporanPiutang() {
  const [pinjaman, setPinjaman] = useState([]); 
  const [pinjamanData, setPinjamanData] = useState([]); 
  const [asesorData, setAsesorData] = useState([]); 
  const history = useHistory(); 
  const [plafond, setPlafond] = useState([]); 
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [persentaseJumlahPinjaman, setPersentasePinjaman] = useState([]);
  const [totalPeminjam, setTotalPeminjam] = useState(0); 
  const [totalSudahDibayar, setTotalDibayar] = useState([]);
  const [plafondTersedia, setPlafondTersedia] = useState(0); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [hidden, setHidden] = useState(false); 

  const filteredLaporanPiutang = pinjaman.filter((pinjaman) => {
    const angsuranStatus = pinjaman?.AngsuranPinjaman?.[0]?.status && pinjaman.AngsuranPinjaman[0].status.toLowerCase() || ""; // Ambil status dari AngsuranPinjaman
    const isLunas = angsuranStatus === "Lunas";
    const isBelumLunas = angsuranStatus === "Belum Lunas";
  
    const matchesStatusQuery =
      (searchQuery === "lunas" && isLunas) ||
      (searchQuery === "belum lunas" && isBelumLunas);
  
    return (
      matchesStatusQuery ||
      (pinjaman.id_pinjaman && String(pinjaman.id_pinjaman).toLowerCase().includes(searchQuery)) ||
      (pinjaman.id_peminjam && String(pinjaman.id_peminjam).toLowerCase().includes(searchQuery)) ||
      (pinjaman?.Peminjam?.nama && String(pinjaman.Peminjam.nama).toLowerCase().includes(searchQuery)) ||
      (pinjaman?.Peminjam?.departemen && String(pinjaman.Peminjam.departemen).toLowerCase().includes(searchQuery)) ||
      (pinjaman?.Peminjam?.divisi && String(pinjaman.Peminjam.divisi).toLowerCase().includes(searchQuery)) ||
      (pinjaman.tanggal_pengajuan && String(pinjaman.tanggal_pengajuan).toLowerCase().includes(searchQuery)) ||
      (pinjaman.status_pelunasan && String(pinjaman.status_pelunasan).toLowerCase().includes(searchQuery))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLaporanPiutang.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: "", role: ""}); 

  useEffect(() => {
    toast.dismiss();
  });

  useEffect(() => {
 
   const fetchData = async () => {
     try {
       if (!token) {
         console.error("Token tidak tersedia");
         return;
       }

       const [
         responseTotalPinjaman,
         responseTotalPeminjam,
         responseTotalDibayar,
         responsePlafond,
       ] = await Promise.all([
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
 
       const totalPinjamanKeseluruhan = responseTotalPinjaman.data?.totalPinjamanKeseluruhan || 0;
       const totalPeminjam = responseTotalPeminjam.data?.totalPeminjam || 0;
       const totalSudahDibayar = responseTotalDibayar.data?.total_dibayar || 0;
       const plafondTersedia = responsePlafond.data?.latestPlafond || 0;

       setTotalPinjamanKeseluruhan(totalPinjamanKeseluruhan);
       setTotalPeminjam(totalPeminjam);
       setTotalDibayar(totalSudahDibayar);
       setPlafondTersedia(plafondTersedia);

     } catch (error) {
       console.error("Error fetching data:", error.message);
     }
   };
 
   fetchData();
 }, [token]);

  useEffect(() => {
    setHidden(userData.role === "Finance");
  }, [userData]);
 
  
  const getPinjaman = async () =>{
    try {
      // setLoading(true);
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

  const getPinjamanData = async (req, res) =>{
    try {
      // setLoading(true);
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

  const getPlafond = async () =>{
    try {
      // setLoading(true);
      const response = await axios.get("http://10.70.10.157:5000/jumlah-plafond", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setPlafond(response.data.totalPlafond);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPinjaman();
    getPinjamanData();
    getPlafond();
    // fetchData();
  });


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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

    const handleImportButtonClick = () => {
      setShowImportModal(true);
    }
    
    const handleImportSuccess = () => {
      getPinjaman();
      // getAntrean();
      // toast.success("Data Pinjaman berhasil diimport!", {
      //     position: "top-right",
      //     autoClose: 5000,
      //     hideProgressBar: true,
      // });
    };
  
  

  const downloadCSV = (data) => {
  const header = ["id_pinjaman", "tanggal_pengajuan", "jumlah_pinjaman", "jumlah_angsuran", "pinjaman_setelah_pembulatan", "rasio_angsuran", "keperluan", "id_peminjam", "id_asesor", "sudah_dibayar", "belum_dibayar", "bulan_angsuran", "status"];

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Data untuk CSV tidak valid atau kosong.");
    return;
  }

  const filteredData = data.filter(
    (item) =>
      item.status_pengajuan === "Diterima" &&
      item.status_transfer === "Selesai"
  );

  const rows = filteredData.map((item) => {
    // console.log("Pinjaman SudahDibayar:", item.SudahDibayar);
    
    const totalSudahDibayar = item.SudahDibayar
    ? item.SudahDibayar.reduce((total, angsuran) => {
        const sudahDibayar = angsuran.sudah_dibayar ? parseFloat(angsuran.sudah_dibayar) : 0;
        return total + sudahDibayar;
      }, 0)
    : 0;

    const belumDibayar = item.AngsuranPinjaman?.[0]?.belum_dibayar ?? "N/A";
    const bulanAngsuran = item.AngsuranPinjaman?.[0]?.bulan_angsuran ?? "N/A";
    const status =
      item.AngsuranPinjaman &&
      item.AngsuranPinjaman[0] &&
      parseFloat(belumDibayar) === 0
        ? "Lunas"
        : "Belum Lunas";

    return [
      item.id_pinjaman ?? "N/A",
      item.tanggal_pengajuan ?? "N/A",
      item.jumlah_pinjaman ?? "N/A",
      item.jumlah_angsuran ?? "N/A",
      item.pinjaman_setelah_pembulatan ?? "N/A",
      item.rasio_angsuran ?? "N/A",
      item.keperluan ?? "N/A",
      item.id_peminjam ?? "N/A",
      item.id_asesor ?? "N/A",
      totalSudahDibayar,
      belumDibayar,
      bulanAngsuran,
      status
    ];


  });

  // console.log("Baris CSV:", rows);

  const csvContent = [header, ...rows]
    .map((row) => row.join(","))
    .join("\n");

    try {
      const csvContent = [header, ...rows]
        .map((row) => (Array.isArray(row) ? row.join(",") : "")) // Validasi array sebelum join
        .join("\n");
  
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "laporan_piutang.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Kesalahan saat membuat CSV:", error);
    }

  // console.log("Data untuk CSV:", data);

  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Laporan Piutang Karyawan", 12, 20);
    
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
      "ID Peminjam", 
      "Nama Peminjam", 
      "Departemen", 
      "Divisi", 
      "Tanggal Pengajuan", 
      "Jumlah Pinjaman", 
      "Nama Asesor", 
      "Jumlah Angsuran", 
      "Pinjaman Setelah Pembulatan", 
      "Rasio Angsuran",
      "Keperluan",
      "Total Sudah Dibayar", 
      "Belum Dibayar", 
      "Bulan Angsuran", 
      "Status Pembayaran"
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
        10: { cellWidth: 'auto' }, 
        11: { cellWidth: 'auto' }, 
        12: { cellWidth: 'auto' }, 
        13: { cellWidth: 'auto' }, 
        14: { cellWidth: 'auto' }, 
        15: { cellWidth: 'auto' }, 
      },
      tableWidth: 'auto',
  
    });
  
    doc.save("laporan_piutang_karyawan.pdf");
  };

  return (
    <>
      <Container fluid>
        <Row>
          <Col lg="3" sm="6">
              <Card className="card-stats">
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Jumlah Plafond</p>
                    </div>
                  </Col>
                  <Col>
                  <div className="text-right">
                    <Card.Title className="card-plafond" as="h4">Rp {formatRupiah(plafond || 0)}</Card.Title>
                  </div>
                  </Col>
                </Row>
                )}
              </Card.Body>
                {/* )} */}
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  Jumlah Plafond
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
        {plafondTersedia !== null ? (
                <Card className="card-stats">
                  <Card.Body>
                    {loading ? (
                      <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p>Loading...</p>
                      </div>
                    ) : (
                    <Row>
                      <Col xs="5">
                        <div className="icon-big text-center icon-warning">
                          <i className="nc-icon nc-money-coins text-success"></i>
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Plafond Tersedia</p>
                        </div>
                      </Col>
                      <Col>
                      <div className="text-right">
                        <Card.Title as="h4" className="card-plafond"> Rp
                          {(() => {
                            return formatRupiah(plafondTersedia); 
                          })()}
                          </Card.Title>
                      </div>
                      </Col>
                    </Row>
                    )}
                  </Card.Body>
                  <Card.Footer>
                    <hr />
                    <div className="stats">Plafond Tersisa</div>
                  </Card.Footer>
                </Card>
              ) : (
                <p>Loading...</p>
              )}
          </Col>

          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-notes text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Jumlah Pinjaman</p>

                    </div>
                  </Col>
                  <Col>
                    <div className="text-right">
                    <Card.Title as="h4" className="card-plafond">Rp {formatRupiah(totalPinjamanKeseluruhan)}</Card.Title>
                    </div>
                  </Col>
                </Row>
                )}
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  Jumlah Pinjaman
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-badge text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Jumlah Peminjam</p>
                     
                    </div>
                  </Col>
                  <Col>
                    <div className="text-right">
                    <Card.Title as="h4" className="card-plafond">{totalPeminjam}</Card.Title>
                    </div>
                  </Col>
                </Row>
                )}
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  Jumlah Peminjam
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-5">

        <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="info"
            onClick={handleImportButtonClick}
            hidden={role === "Finance"}
            >
            <FaFileImport style={{ marginRight: '8px' }} />
            Import Data
        </Button>
        
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
                <Card.Title as="h4">Laporan Piutang Karyawan</Card.Title>
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
                        <th className="border-0 center">ID Pinjaman</th>
                        <th className="border-0 center">ID Karyawan</th>
                        <th className="border-0 center">Nama Karyawan</th>
                        <th className="border-0 center">Departemen</th>
                        <th className="border-0 center">Divisi</th>
                        <th className="border-0 center">Tanggal Pengajuan</th>
                        <th className="border-0 center">Jumlah Pinjaman</th>
                        <th className="border-0 center">Ditransfer Oleh</th>
                        <th className="border-0 center">Jumlah Angsuran</th>
                        <th className="border-0 center">Jumlah Pinjaman Setelah Pembulatan</th>
                        <th className="border-0 center">Rasio Angsuran</th>
                        <th className="border-0 center">Sudah Dibayar</th>
                        <th className="border-0 center">Belum Dibayar</th>
                        <th className="border-0 center">Sisa Bulan</th>
                        <th className="border-0 center">Status</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        {currentItems
                        .filter((item) => item.status_pengajuan !== "Ditunda" && item.status_transfer !== "Belum Ditransfer" && item.status_pengajuan !== "Dibatalkan" && item.status_transfer !== "Dibatalkan")
                        .map((pinjaman) => {

                          const totalSudahDibayar = pinjaman.SudahDibayar
                          ? pinjaman.SudahDibayar.reduce((total, angsuran) => {
                            const sudahDibayar = angsuran.sudah_dibayar ? parseFloat(angsuran.sudah_dibayar) : 0;
                            return total + sudahDibayar;
                      
                            }, 0)
                          : 0;
              
                        return ( 
                          <tr key={pinjaman.id_pinjaman}>
                            <td className="text-center">{pinjaman.id_pinjaman}</td>
                            <td className="text-center">{pinjaman.id_peminjam}</td>
                            <td className="text-center">{pinjaman.Peminjam ? pinjaman.Peminjam.nama: 'N/A'}</td>
                            <td className="text-center">{pinjaman.Peminjam ? pinjaman.Peminjam.departemen: 'N/A'}</td>
                            <td className="text-center">{pinjaman.Peminjam ? pinjaman.Peminjam.divisi: 'N/A'}</td>
                            <td className="text-center">{pinjaman.tanggal_pengajuan}</td>
                            <td className="text-right">{formatRupiah(pinjaman.jumlah_pinjaman)}</td>
                            <td className="text-center">{pinjaman.Asesor ? pinjaman.Asesor.nama: 'N/A'}</td>
                            <td className="text-right">{formatRupiah(pinjaman.jumlah_angsuran)}</td>
                            <td className="text-right">{formatRupiah(pinjaman.pinjaman_setelah_pembulatan)}</td>
                            <td className="text-right">{pinjaman.rasio_angsuran}</td>
                            <td className="text-right">{formatRupiah(totalSudahDibayar)}</td>
                            <td className="text-right">
                            {formatRupiah(pinjaman.AngsuranPinjaman && pinjaman.AngsuranPinjaman.length > 0 ? pinjaman.AngsuranPinjaman[0].belum_dibayar : (pinjaman.pinjaman_setelah_pembulatan))}
                            </td>
                            <td className="text-center">{pinjaman.AngsuranPinjaman && pinjaman.AngsuranPinjaman.length > 0 ? 60 - pinjaman.AngsuranPinjaman[0].bulan_angsuran : '60'}</td>
          
                            <td className="text-center">
                            {pinjaman.status_pelunasan === "Lunas" ? (
                              <Badge pill bg="success p-2">
                              Lunas
                              </Badge >
                            ) : (
                              <Badge pill bg="danger p-2">
                              Belum Lunas
                              </Badge >
                            )}
                          </td>
                          </tr>
                        );
                      })}
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
                  totalItemsCount={filteredLaporanPiutang.length}
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

export default LaporanPiutang;