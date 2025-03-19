import React, { useEffect, useState } from "react";
import {FaPlusCircle, FaRegTimesCircle} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import AddPengajuan from "components/ModalForm/AddPengajuan.js";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import { toast } from 'react-toastify';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Heartbeat from "./Heartbeat.js";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";

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

function RiwayatPengajuanKaryawan() {
  const [pinjaman, setPinjaman] = useState([]); 
  const [pinjamanData, setPinjamanData] = useState([]); 
  const [antrean, setAntrean] = useState([]); 
  const [message, setMessage] = useState("");
  const [selectedPinjaman, setSelectedPinjaman] = useState(null);
  const [plafondTersedia, setPlafondTersedia] = useState([]);
  const history = useHistory(); 
  const [error, setError] = useState("");
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [totalPeminjam, setTotalPeminjam] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportModal, setShowImportModal] = useState(false); 
  const [totalSudahDibayar, setTotalDibayar] = useState([]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const filteredPinjamanFinal = pinjaman
  .filter((item) => item.id_peminjam === userData.id_karyawan)
  .filter((pinjaman) => 
    (pinjaman.id_pinjaman && String(pinjaman.id_pinjaman).toLowerCase().includes(searchQuery)) ||
    (pinjaman.tanggal_pengajuan && String(pinjaman.tanggal_pengajuan).toLowerCase().includes(searchQuery)) ||
    (pinjaman?.Asesor?.nama && String(pinjaman.Asesor.nama).toLowerCase().includes(searchQuery)) ||
    (pinjaman.keperluan && String(pinjaman.keperluan).toLowerCase().includes(searchQuery)) ||
    (pinjaman.status_pengajuan && String(pinjaman.status_pengajuan).toLowerCase().includes(searchQuery)) ||
    (pinjaman.status_transfer && String(pinjaman.status_transfer).toLowerCase().includes(searchQuery))
  
  )

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPinjamanFinal.slice(indexOfFirstItem, indexOfLastItem);

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


  useEffect(()=> {
    try {
      Promise.all([
        axios.get("http://10.70.10.157:5000/total-pinjaman-keseluruhan", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        }),
        axios.get("http://10.70.10.157:5000/total-peminjam", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        }),
        axios.get("http://10.70.10.157:5000/total-dibayar", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        }), 
        axios.get("http://10.70.10.157:5000/plafond-tersedia", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        })
      ])
        .then(([responseTotalPinjaman, responseTotalPeminjam, responseTotalDibayar, responsePlafond]) => {
          if (responseTotalPinjaman.data && responseTotalPinjaman.data.totalPinjamanKeseluruhan !== undefined) {
            const totalPinjamanKeseluruhan = responseTotalPinjaman.data.totalPinjamanKeseluruhan || 0;
            setTotalPinjamanKeseluruhan(totalPinjamanKeseluruhan);  
          } else {
            console.error("Total Pinjaman not found in the response:", responseTotalPinjaman.data);
            setTotalPinjamanKeseluruhan(0); 
          }
  
          const totalPeminjam = responseTotalPeminjam.data.totalPeminjam || 0;
          const totalSudahDibayar = responseTotalDibayar.data.total_dibayar || 0;
  
          setPlafondTersedia(responsePlafond.data.plafondTersedia); 
  
  
          setTotalPeminjam(totalPeminjam); 
          setTotalDibayar(totalSudahDibayar);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } catch (error) {
      console.error(error.message);
    }
  }, [token]); 

  useEffect(() => {
    fetchUserData();
    getPinjaman();
    getPinjamanData();
    getAntrean();
    fetchAntrean();
  }, []);

  const data_plafond = {
    labels: ['Total Pinjaman', 'Plafond Tersedia'],
    datasets: [
      {
        label: 'Pinjaman Overview',
        data: [
          totalPinjamanKeseluruhan,
          plafondTersedia
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverOffset: 4
      }
    ]
  };

  const getPinjaman = async () =>{
    try {
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

  const isAjukanDisabled = pinjaman.some(
    (item) => 
      item.id_peminjam === userData?.id_karyawan &&
      item.status_pelunasan !== "Lunas"
  );

  const getPinjamanData = async () =>{
    try {
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

const findNomorAntrean = (id_pinjaman) => {
  // console.log("Searching for antrean with id_peminjam:", id_pinjaman);

  const antreanRecord = antrean.find((item) => item.id_pinjaman === id_pinjaman);
  if (antreanRecord) {
    console.log("Found antrean record:", antreanRecord);
  } else {
    console.log("No antrean record found for id_pinjaman:", id_pinjaman);
  }

  return antreanRecord ? antreanRecord.nomor_antrean : '-';
};


  const handleBatalPengajuan = async (pinjaman) => {
    try {
      // console.log('Mencoba mengupdate status pengajuan:', pinjaman);
  
      const response = await axios.put(`http://10.70.10.157:5000/batal-pengajuan/${pinjaman.id_pinjaman}`, {
        status_pengajuan: "Dibatalkan",
        status_transfer: "Dibatalkan",
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
  
      // console.log('Pengajuan berhasil dibatalkan:', response.data);
      setShowModal(false);
 
      toast.success('Pengajuan berhasil dibatalkan!', {
        position: "top-right", 
        autoClose: 5000,
        hideProgressBar: true,
      });
  
      getPinjaman(); 
      getAntrean();
  
    } catch (error) {
      console.error('Error updating status_pengajuan:', error.response ? error.response.data : error.message);
      toast.error('Gagal memperbarui status pengajuan.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  };


  const handleAddSuccess = () => {
    getPinjaman();
    getAntrean();
    toast.success("Data pengajuan baru berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
};

  
  const handleModalOpen = (pinjaman) => {
    setSelectedPinjaman(pinjaman); 
    setShowModal(true); 
  };
  

  const downloadCSV = (data) => {
    const header = ["id_pinjaman", "tanggal_pengajuan", "nomor_antrean", "jumlah_pinjaman", "jumlah_angsuran", "pinjaman_setelah_pembulatan", "keperluan", "status_pengajuan", "status_transfer", "id_peminjam", "id_asesor"];
    
    const filteredData = data.filter(
      (item) =>
        item.status_pengajuan === "Ditunda" ||
        item.status_transfer === "Belum Ditransfer"
    );
    
    const rows = data.map((item) => {

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

  return (
    <>
      <Container fluid>
      {/* <ToastContainer /> */}
      <Heartbeat/>
        <Row className="mb-4">
            {/* <div>
            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="success"
              onClick={() => setShowAddModal(true)}
              // disabled={pinjaman.status_pelunasan !== "Lunas"}
              disabled={isAjukanDisabled}
              >
              <FaPlusCircle style={{ marginRight: '8px' }} />
              Ajukan Pinjaman
            </Button>

            <AddPengajuan showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />
            </div> */}

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
        </Row>
          
        <Row>
          <Col md="12">
            <Card className="striped-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Riwayat Pengajuan</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                 {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p>Loading...</p>
                    </div>
                  ) : (
                <Table className="table-hover table-striped">
                  <div className="table-scroll" style={{height: 'auto'}}>
                    <table className="flex-table table table-striped table-hover">
                      <thead>
                      <tr>
                        <th className="border-0">ID Pinjaman</th>
                        <th className="border-0">Tanggal Pengajuan</th>
                        <th className="border-0">Jumlah Pinjaman</th>
                        <th className="border-0">Jumlah Angsuran</th>
                        <th className="border-0">Jumlah Pinjaman Setelah Pembulatan</th>
                        <th className="border-0">Nomor Antrean</th>
                        <th className="border-0">Ditransfer Oleh</th>
                        <th className="border-0">Keperluan</th>
                        <th className="border-0">Tanggal Plafond Tersedia</th>
                        <th className="border-0">Status Pengajuan</th>
                        <th className="border-0">Status Transfer</th>
                        <th className="border-0">Aksi</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        { currentItems
                        .map ((pinjaman) => ({
                          ...pinjaman,
                          nomor_antrean: findNomorAntrean(pinjaman.id_pinjaman),
                        }))
                        .sort((a, b) => a.nomor_antrean - b.nomor_antrean)
                        .map((pinjaman) => (
                          <tr key={pinjaman.id_pinjaman}>
                          <td className="text-center">{pinjaman.id_pinjaman}</td>
                          <td className="text-center">{pinjaman.tanggal_pengajuan}</td>
                          <td className="text-right">{formatRupiah(pinjaman.jumlah_pinjaman)}</td>
                          <td className="text-right">{formatRupiah(pinjaman.jumlah_angsuran)}</td>
                          <td className="text-right">{formatRupiah(pinjaman.pinjaman_setelah_pembulatan)}</td>
                          <td className="text-right">{findNomorAntrean(pinjaman.id_pinjaman)}</td>
                          <td className="text-center">{pinjaman.Asesor ? pinjaman.Asesor.nama: 'N/A'}</td>
                          <td className="text-center">{pinjaman.keperluan}</td>
                          <td className="text-center">{pinjaman.UpdatePinjamanPlafond ? pinjaman.UpdatePinjamanPlafond.tanggal_plafond_tersedia: '-'}</td>
                          <td className="text-center">
                            {pinjaman.status_pengajuan === "Diterima" ? (
                              <Badge pill bg="success p-2">
                              Diterima
                              </Badge >
                              ) : pinjaman.status_pengajuan === "Dibatalkan" ? (
                              <Badge pill bg="danger p-2">
                              Dibatalkan
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
                                ) : pinjaman.status_transfer === "Dibatalkan" ? (
                                <Badge pill bg="danger p-2">
                                Dibatalkan
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
                              variant="danger"
                              onClick={() => {
                                handleModalOpen(pinjaman); 
                              }}
                              disabled={pinjaman.status_pengajuan === "Diterima" || pinjaman.status_pengajuan === "Dibatalkan"}
                              style={{
                                width: 103,
                                fontSize: 14,
                              }}>
                              <FaRegTimesCircle style={{ marginRight: '8px' }} />
                              Batal
                            </Button>
                          </td>
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
                  totalItemsCount={filteredPinjamanFinal.length}
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
        <Modal.Title>Pembatalan Pengajuan Pinjaman</Modal.Title>
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
        Yakin ingin membatalkan pengajuan pinjaman?
      </Modal.Body>
      <Modal.Footer className="mb-4">
        <Button variant="danger"  onClick={() => handleBatalPengajuan(selectedPinjaman)}>
          Ya
        </Button>
        <Button variant="success" onClick={() => setShowModal(false)}>
          Tidak
        </Button>
      </Modal.Footer>
      </Modal>
    </>
  );
}

export default RiwayatPengajuanKaryawan;
