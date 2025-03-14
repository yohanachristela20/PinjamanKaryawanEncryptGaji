import React, { useEffect, useState } from "react";
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
// import Heartbeat from "./Heartbeat.js";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import cardBeranda from "../assets/img/beranda3.png";
import "../assets/scss/lbd/_table-header.scss";

import {
  Badge,
  Card,
  Table,
  Container,
  Row,
  Col,
  Spinner
} from "react-bootstrap";


function BerandaKaryawan() {
  const [pinjaman, setPinjaman] = useState([]); 
  const [pinjamanData, setPinjamanData] = useState([]); 
  const [antrean, setAntrean] = useState([]); 
  const [plafondTersedia, setPlafondTersedia] = useState([]);
  const history = useHistory(); 
  const [error, setError] = useState("");
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [totalPeminjam, setTotalPeminjam] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportModal, setShowImportModal] = useState(false); 
  const [totalSudahDibayar, setTotalDibayar] = useState([]);

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
    (pinjaman.status_pelunasan && String(pinjaman.status_pelunasan).toLowerCase().includes(searchQuery)))
  .filter((item) => item.status_pengajuan !== "Ditunda" && item.status_transfer !== "Belum Ditransfer" && item.status_pengajuan !== "Dibatalkan" && item.status_transfer !== "Dibatalkan");

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPinjamanFinal.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  }

  const token = localStorage.getItem("token");

  
  useEffect(() => {
    fetchUserData();
    getPinjaman();
    // getPinjamanData();
    // getAntrean();
    // fetchAntrean();
  }, []);

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

  // const fetchAntrean = async () => {
  //   try {
  //     const response = await axios.get("http://10.70.10.157:5000/antrean-pengajuan", {
  //       headers: {
  //           Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     setAntrean(response.data);
  //   } catch (error) {
  //     console.error("Error fetching antrean:", error.message);
  //   }
  // };


  useEffect(()=> {
    try {
      if (!token) {
        console.error("Token tidak tersedia");
        return;
      }

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
  
          // console.log("Sudah dibayar: ",totalSudahDibayar)
  
          setPlafondTersedia(responsePlafond.data.plafondTersedia); 
  
  
          setTotalPeminjam(totalPeminjam); 
          setTotalDibayar(totalSudahDibayar);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          // setTotalPinjamanKeseluruhan(0); 
        });
    } catch (error) {
      console.error(error.message);
    }
  }, [token]); 

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
  

  return (
    <>

    <div className="home-card">
      <div className="card-content">
        <h2 className="card-title">Hai, {userData.nama}!</h2>
        <h4 className="card-subtitle">Solusi finansial anda dimulai dari sini.</h4><hr/>
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
      {/* <Heartbeat/> */}
      
        <Row className="mt-4 mb-4">
          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
        </Row>
          
        <Row>
          <Col md="12">
            <Card className="striped-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Riwayat Pinjaman</Card.Title>

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
                        <th className="border-0">ID Pinjaman</th>
                        <th className="border-0">Tanggal Pengajuan</th>
                        <th className="border-0">Jumlah Pinjaman</th>
                        <th className="border-0">Jumlah Angsuran</th>
                        <th className="border-0">Jumlah Pinjaman Setelah Pembulatan</th>
                        <th className="border-0">Keperluan</th>
                        <th className="border-0">Ditransfer Oleh</th>
                        <th className="border-0">Sisa Angsuran (Bulan)</th>
                        <th className="border-0">Sudah Dibayar</th>
                        <th className="border-0">Belum Dibayar</th>
                        <th className="border-0">Status Pelunasan</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        { currentItems
                        .map((pinjaman) => {
                          // console.log('Pinjaman AngsuranPinjaman:', pinjaman.SudahDibayar);

                          const totalSudahDibayar = pinjaman.SudahDibayar
                          ? pinjaman.SudahDibayar.reduce((total, angsuran) => {
                            const sudahDibayar = angsuran.sudah_dibayar ? parseFloat(angsuran.sudah_dibayar) : 0;
                            return total + sudahDibayar;
                      
                            }, 0)
                          : 0;

                        return(
                          <tr key={pinjaman.id_pinjaman}>
                          <td className="text-center">{pinjaman.id_pinjaman}</td>
                          <td className="text-center">{pinjaman.tanggal_pengajuan}</td>
                          <td className="text-right">{formatRupiah(pinjaman.jumlah_pinjaman)}</td>
                          <td className="text-right">{formatRupiah(pinjaman.jumlah_angsuran)}</td>
                          <td className="text-right">{formatRupiah(pinjaman.pinjaman_setelah_pembulatan)}</td>
                          <td className="text-center">{pinjaman.keperluan}</td>
                          <td className="text-center">{pinjaman.Asesor ? pinjaman.Asesor.nama: 'N/A'}</td>
                          <td className="text-center">{pinjaman.AngsuranPinjaman && pinjaman.AngsuranPinjaman.length > 0 ? 60 - pinjaman.AngsuranPinjaman[0].bulan_angsuran : '60'}</td>
                          <td className="text-right">{formatRupiah(totalSudahDibayar)}</td>
                          <td className="text-right">
                            {formatRupiah(pinjaman.AngsuranPinjaman && pinjaman.AngsuranPinjaman.length > 0 ? pinjaman.AngsuranPinjaman[0].belum_dibayar : (pinjaman.pinjaman_setelah_pembulatan))}
                            </td>
                          {/* <PinjamanRow pinjaman={pinjaman}/> */}
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
                        })
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
    </>
  );
}

export default BerandaKaryawan;
