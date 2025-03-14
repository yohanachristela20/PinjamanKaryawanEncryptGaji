import React, { useState, useEffect } from "react";
import AcceptedAlert from "components/Alert/AcceptedAlert.js";
import DeclineAlert from "components/Alert/DeclineAlert.js";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaCheckCircle, FaTimesCircle, FaHistory} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";

const BASE_URL = 'http://10.70.10.157:5000';

export const fetchHistoryPinjaman = async (idPeminjam) => {
  return axios.get(`${BASE_URL}/history-pinjaman/${idPeminjam}`, {
    headers: {
      Authorization: `Bearer ${token}`,
  },
  });
};

import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col, 
  Table
} from "react-bootstrap";

function ScreeningKaryawan({ setHasilScreening }) {
  const location = useLocation();
  const [selectedPinjaman, setSelectedPinjaman] = useState(
    location?.state?.selectedPinjaman || null
  );
  const [keperluan, setKeperluan] = useState(''); 
  const [jumlah_pinjaman, setJumlahPinjaman] = useState(0);
  const [totalSudahDibayar, setTotalSudahDibayar] = useState(0);  
  const [belumDibayar, setBelumDibayar] = useState(0);  
  const [pinjaman, setPinjaman] = useState([]); 
  const [totalPinjaman, setTotalPinjaman] = useState(0); 
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [jumlahPlafondSaatIni, setPlafondSaatIni] = useState(0);

  const [id_pinjaman, setIdPinjaman] = useState(0);
  const [plafond, setPlafond] = useState([]); 
  const [selectedPlafond, setSelectedPlafond] = useState(null); 
  const [plafondTersedia, setPlafondTersedia] = useState(null);
  const plafondTersediaNumber = parseFloat(plafondTersedia);
  const jumlahPinjamanNumber = parseFloat(selectedPinjaman?.jumlah_pinjaman);
  const [isDeclined, setIsDeclined] = useState(false);
  const history = useHistory();
  const [screeningResult, setScreeningResult] = useState(null);
  const [rasio_angsuran] = useState(0);

  
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadScreeningData = () => {
      const savedScreening = localStorage.getItem("hasilScreening"); 
      if (savedScreening) {
        const parsedData = JSON.parse(savedScreening);
        setTotalSudahDibayar(parsedData.totalSudahDibayar || 0);
        setTotalPinjaman(parsedData.totalPinjaman || 0);
        setPlafondTersedia(parsedData.jumlahPlafondSaatIni || 0);
        setScreeningResult(parsedData); 
      }
    }

    const fetchData = async () => {
      if (!token) {
        console.error("Token tidak tersedia");
        return;
      }
      try {
        const [
          responseTotalSudahDibayar,
          responseTotalPinjaman,
          responseTotalJumlahPinjaman,
          responsePlafond,
        ] = await Promise.all([
          axios.get(`http://10.70.10.157:5000/angsuran/total-sudah-dibayar/${selectedPinjaman?.id_peminjam}`, {
            headers: {
              Authorization: `Bearer ${token}`,
          },
          }),
          axios.get(`http://10.70.10.157:5000/pinjaman/total-pinjaman/${selectedPinjaman?.id_peminjam}`, {
            headers: {
              Authorization: `Bearer ${token}`,
          },
          }),
          axios.get("http://10.70.10.157:5000/total-pinjaman-keseluruhan", {
             headers: {
              Authorization: `Bearer ${token}`,
          },
          }),
          await axios.get(
          `http://10.70.10.157:5000/plafond-update-saat-ini/${selectedPinjaman.id_pinjaman}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          // axios.get("http://10.70.10.157:5000/plafond-tersedia", {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          // },
          // }),
        ]);
  
        const totalSudahDibayar = responseTotalSudahDibayar.data.total_sudah_dibayar || 0;
        setTotalSudahDibayar(totalSudahDibayar);
  
        const totalPinjaman = responseTotalPinjaman.data.total_pinjaman || 0;
        setTotalPinjaman(totalPinjaman);
  
        const totalPinjamanKeseluruhan = responseTotalJumlahPinjaman.data.totalPinjamanKeseluruhan || 0;
        setTotalPinjamanKeseluruhan(totalPinjamanKeseluruhan);
  
        // const plafondTersedia = responsePlafond.data.plafondTersedia || 0;
        // setPlafondTersedia(plafondTersedia);
        // console.log("Plafond tersedia:", plafondTersedia);

        const jumlahPlafondSaatIni = responsePlafond.data?.plafondSaatIni || 0;
        setPlafondSaatIni(jumlahPlafondSaatIni);
        
        const hasilScreening = {
          totalSudahDibayar,
          totalPinjaman,
          jumlahPlafondSaatIni,
          // plafondTersedia,
          // totalPinjamanKeseluruhan, 
          idPeminjam: selectedPinjaman?.id_peminjam, 
        }; 
        localStorage.setItem("hasilScreening", JSON.stringify(hasilScreening)); 
        setScreeningResult(hasilScreening); 
        // console.log("Plafond TERSEDIA: ", plafondTersedia);
        // console.log("Plafond saat ini: ", jumlahPlafondSaatIni);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    if (!selectedPinjaman) {
      const savedPinjaman = localStorage.getItem("selectedPinjaman");
      if (savedPinjaman) {
        setSelectedPinjaman(JSON.parse(savedPinjaman));
      }
    } else {
      // Simpan `selectedPinjaman` ke `localStorage` untuk digunakan ulang
      localStorage.setItem("selectedPinjaman", JSON.stringify(selectedPinjaman));
    }
    // } else {
    //   loadScreeningData();
    // }

    if (selectedPinjaman?.id_peminjam) {
      fetchData();
    } else {
      loadScreeningData();
    }

    // loadScreeningData();
  }, [selectedPinjaman, token]);

  // {jumlahPlafondSaatIni !== null && (
  //   <p>Masih ada plafond tersisa: {jumlahPlafondSaatIni}</p>
  // )}
  // {screeningResult && (
  //   <p>Hasil Screening: {screeningResult.jumlahPlafondSaatIni >= 0 ? "Diterima" : "Ditolak"}</p>
  // )}


  const updatePinjamanStatus = (status) => {
    axios.put(`http://10.70.10.157:5000/pinjaman/cancel/${selectedPinjaman.id_pinjaman}`, {
      not_compliant: status, 
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
    },
    })
    .then(response => {
      console.log('Pinjaman status updated:', response.data);
    })
    .catch(error => {
      console.error('Error updating pinjaman status:', error);
    });
  }
  

  const getPlafond = async () =>{
    try {
      const response = await axios.get("http://10.70.10.157:5000/plafond");
      setPlafond(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };
  
  const getPinjaman = async () =>{
    try {
      const response = await axios.get("http://10.70.10.157:5000/pinjaman");
      setPinjaman(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  const formatRupiah = (angka) => {
    let gajiString = angka.toString().replace(".00");
    let sisa = gajiString.length % 3;
    let rupiah = gajiString.substr(0, sisa);
    let ribuan = gajiString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
  };

  const calculateYearsAndMonth = (tanggalMasuk) => {
    const currentDate = new Date();
    const startDate = new Date(tanggalMasuk); 

    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth(); 

    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} Tahun ${months} Bulan`; 
  }; 

  const calculateYears = (tanggalMasuk) => {
    const currentDate = new Date(); 
    const startDate = new Date(tanggalMasuk); 

    let years = currentDate.getFullYear() - startDate.getFullYear();

    return `${years}`; 
  }

  const calculatePensiun = (tanggalMasuk, jenisKelamin) => {
    const currentYear = new Date().getFullYear(); 
    const startYear = new Date(tanggalMasuk).getFullYear(); 

    let tahunPensiun;

    if (jenisKelamin === "L") {
      tahunPensiun = 60;
    } else if (jenisKelamin === "P") {
      tahunPensiun = 55; 
    }

    const tahunPensiunSeharusnya = startYear + tahunPensiun; 
    const jarakPensiun = tahunPensiunSeharusnya - currentYear;
 
    return `${jarakPensiun}`; 
  }


  const calculaterasio_angsuran = (jumlahPinjaman, gajiPokok) => {
    if (!jumlahPinjaman || !gajiPokok) return 0; 
  
    // console.log("Jumlah pinjaman: ", jumlahPinjaman);
    // console.log("Gaji pokok: ", gajiPokok);
  
    const angsuranBulanan = jumlahPinjaman / 60;
    // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10;
    const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100)
  
    // console.log("Angsuran bulanan: ", angsuranBulanan);
    // console.log("Rasio angsuran (persentase): ", rasio_angsuran);
  
    return parseFloat(rasio_angsuran.toFixed(2)); 

    // console.log(
    //   "Rasio angsuran:",
    //   calculaterasio_angsuran(selectedPinjaman.jumlah_pinjaman, selectedPinjaman.Peminjam.gaji_pokok)
    // );
  };
  

  const totalBelumDibayar =
  selectedPinjaman &&
  selectedPinjaman.BelumDibayar &&
  selectedPinjaman.BelumDibayar.length > 0
    ? Object.values(
        selectedPinjaman.BelumDibayar.filter(
          (angsuran) => angsuran.belum_dibayar >= 0 // Pastikan hanya proses data valid
        ).reduce((grouped, angsuran) => {
          // Kelompokkan berdasarkan id_pinjaman
          if (!grouped[angsuran.id_pinjaman]) {
            grouped[angsuran.id_pinjaman] = [];
          }
          grouped[angsuran.id_pinjaman].push(angsuran);
          return grouped;
        }, {})
      )
        .map((pinjamanAngsuran) => {
          // Ambil angsuran terakhir berdasarkan id_angsuran (lexicographical order)
          const angsuranTerakhir = pinjamanAngsuran.reduce(
            (latest, current) =>
              current.id_angsuran > latest.id_angsuran ? current : latest
          );
          // console.log(
          //   `ID Pinjaman: ${angsuranTerakhir.id_pinjaman}, ID Angsuran Terakhir: ${angsuranTerakhir.id_angsuran}, Belum Dibayar: ${angsuranTerakhir.belum_dibayar}`
          // );
          return angsuranTerakhir.belum_dibayar; // Ambil hanya nilai belum_dibayar
        })
        .reduce((total, belumDibayar) => total + parseFloat(belumDibayar || 0), 0) // Jumlahkan
    : 0;

console.log("Total belum dibayar:", totalBelumDibayar);

  return (
    <>
    {/* <div>
      <h1>Screening Karyawan</h1>
      {screeningResult && (
        <div>
          <p>Total Sudah Dibayar: {screeningResult.totalSudahDibayar}</p>
          <p>Total Pinjaman: {screeningResult.totalPinjaman}</p>
          <p>Total Pinjaman Keseluruhan: {screeningResult.totalPinjamanKeseluruhan}</p>
          <p>Plafond Tersedia: {screeningResult.plafondTersedia}</p>
        </div>
      )}
    </div> */}
      <Container fluid>
        <Row>
          <Col className="card-screening" style={{ maxWidth: "100%" }}>
            <Card className="card-screening">
              <Card.Header>
                <Card.Title as="h4" className="mt-3">Form Screening</Card.Title>
                <hr></hr>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>ID Karyawan</label>
                        <Form.Control
                          disabled
                          placeholder="ID Karyawan"
                          type="text"
                          value={selectedPinjaman?.id_peminjam || ""}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Nama Lengkap</label>
                        <Form.Control
                          placeholder="Nama Lengkap"
                          type="text"
                          value={selectedPinjaman?.Peminjam.nama}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Tanggal Masuk</label>
                        <Form.Control
                          placeholder="Tanggal Masuk"
                          type="text"
                          value={selectedPinjaman?.Peminjam.tanggal_masuk}
                        ></Form.Control>
                    </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md--0" md="6">
                      <Form.Group>
                        <label>Masa Kerja</label>
                        <Form.Control
                          placeholder="Tahun"
                          type="text"
                          readOnly
                          value={selectedPinjaman?.Peminjam.tanggal_masuk ? calculateYearsAndMonth(selectedPinjaman.Peminjam.tanggal_masuk): ''}
                        ></Form.Control>
                      </Form.Group>  
                    </Col>
                    <Col className="pl-md-1" md="6">
                      <Form.Group>
                          <label>Jarak Pensiun</label>
                          <Form.Control
                            placeholder="Tahun"
                            type="text"
                            readOnly
                            value={selectedPinjaman?.Peminjam.tanggal_lahir && selectedPinjaman?.Peminjam.jenis_kelamin ? calculatePensiun(selectedPinjaman.Peminjam.tanggal_lahir, selectedPinjaman.Peminjam.jenis_kelamin) + " Tahun": ''}
                          ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <Form.Group>
                        <label>Departemen</label>
                        <Form.Control
                            type="text"
                            value={selectedPinjaman?.Peminjam.departemen}
                          ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Gaji Pokok</label>
                        <Form.Control
                          placeholder="Rp "
                          type="text"
                          value={selectedPinjaman?.Peminjam.gaji_pokok ? "Rp " + formatRupiah(selectedPinjaman.Peminjam.gaji_pokok) : ""}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md-1" md="6">
                      <Form.Group>
                        <label>Jumlah Pinjaman</label>
                        <Form.Control
                          placeholder="Rp"
                          type="text"
                          value={selectedPinjaman?.jumlah_pinjaman ? "Rp " + formatRupiah(selectedPinjaman.jumlah_pinjaman) : ""}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col className="pl-md-1" md="6">
                      <Form.Group>
                        <label>Keperluan</label>
                         <Form.Control
                          placeholder="Pilih Jenis Keperluan"
                          type="text"
                          value={selectedPinjaman?.keperluan}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <hr></hr>
                  <Row>
                    <Col className="mt-2" md="12">
                    <Form.Group>
                        <label>Rasio Angsuran</label>
                        <Form.Control
                          placeholder="%"
                          type="text"
                          readOnly
                          value={
                            selectedPinjaman?.jumlah_pinjaman && selectedPinjaman?.Peminjam.gaji_pokok
                              ? `${calculaterasio_angsuran(
                                  selectedPinjaman.jumlah_pinjaman,
                                  selectedPinjaman.Peminjam.gaji_pokok
                                )} %`
                              : ''
                          }
                          
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>History Pinjaman</label>
                        <Form.Control
                          placeholder="Rp"
                          type="text"
                          readOnly
                          value={`Rp ${formatRupiah(totalPinjaman)}`}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Sudah Dibayar</label>
                        <Form.Control
                          placeholder="Rp"
                          type="text"
                          readOnly
                          value={`Rp ${formatRupiah(totalSudahDibayar)}`}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Belum Dibayar</label>
                        <Form.Control
                          placeholder="Rp"
                          type="text"
                          readOnly
                          value={`Rp ${formatRupiah(totalPinjaman - totalSudahDibayar)}`}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <hr></hr>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                      <label>Hasil Screening</label><br></br>
                      {jumlahPlafondSaatIni !== null &&
                      jumlahPlafondSaatIni !== undefined &&
                      selectedPinjaman?.jumlah_pinjaman !== undefined &&
                      totalPinjaman !== undefined &&
                      totalSudahDibayar !== undefined ? (
                        (() => {
                          const jumlahPlafondSaatIniParsed = parseFloat(jumlahPlafondSaatIni) || 0;
                          const jumlahPinjamanParsed = parseFloat(selectedPinjaman.jumlah_pinjaman) || 0;

                          // console.log("Jumlah plafond saat ini: ", jumlahPlafondSaatIniParsed);

                          const isDeclined =
                            (selectedPinjaman?.Peminjam.tanggal_masuk &&
                              calculateYears(selectedPinjaman.Peminjam.tanggal_masuk) < 5) ||
                            (totalPinjaman - totalSudahDibayar !== 0) ||
                            (selectedPinjaman?.jumlah_pinjaman &&
                              selectedPinjaman?.Peminjam.gaji_pokok &&
                              calculaterasio_angsuran(
                                selectedPinjaman.jumlah_pinjaman,
                                selectedPinjaman.Peminjam.gaji_pokok
                              ) > 20) || rasio_angsuran > 20 ||
                            (selectedPinjaman?.Peminjam.tanggal_lahir &&
                              selectedPinjaman?.Peminjam.jenis_kelamin &&
                              calculatePensiun(
                                selectedPinjaman.Peminjam.tanggal_lahir,
                                selectedPinjaman.Peminjam.jenis_kelamin
                              ) < 6) ||
                              jumlahPlafondSaatIniParsed < 0;
                           // Simpan hasil ke dalam variabel hasilScreening
                           const hasilScreening = isDeclined ? (
                            <> 
                            {/* {plafondTersediaParsed < jumlahPinjamanParsed ? (
                              <DeclineAlert plafondTersedia={plafondTersediaParsed} />
                            ) : ( */}
                              <DeclineAlert/>
                            {/* )} */}
                              {/* {console.log('Hasil screening: Decline')} */}
                              {updatePinjamanStatus(1)} 
                            </>
                          ) : (
                            <>
                              <AcceptedAlert selectedPinjaman={selectedPinjaman} totalPinjaman={totalPinjaman} totalSudahDibayar={totalSudahDibayar} />
                              {/* {console.log('Hasil screening: Accepted')} */}
                              {updatePinjamanStatus(0)} 
                            </>
                          );
                          
                          return hasilScreening;
                          })()
                        ) : (
                          <p>Loading...</p>
                        )}

                    </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md="9">
                    <label>Syarat Pinjaman Karyawan</label>
                      <Table className="table-hover table-striped table-bordered">
                        <thead className="table-primary text-nowwrap">
                          <tr>
                            <th style={{fontSize: 16}}>Syarat Pinjaman</th>
                            <th style={{fontSize: 16}}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-left">Masa kerja >= 5 tahun</td>
                            <td className="text-center">
                              {
                                selectedPinjaman?.Peminjam.tanggal_masuk
                                ? calculateYears(selectedPinjaman.Peminjam.tanggal_masuk) >=5 
                                ? <FaCheckCircle style={{ color: 'green' }} />
                                : <FaTimesCircle style={{ color: 'red' }} />
                                : null
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left">Tidak memiliki pinjaman aktif</td>
                            <td className="text-center">
                            {totalPinjaman - totalSudahDibayar !== 0 
                              ? <FaTimesCircle style={{ color: 'red' }} /> 
                              : <FaCheckCircle style={{ color: 'green' }} />
                            }
                            </td>
                          </tr>
                          {/* <tr>
                            <td className="text-left">Masih ada plafond tersisa</td>
                            <td className="text-center">
                              {
                                // console.log('plafond: ', plafondTersedia),
                                 parseFloat(plafondTersedia) >= parseFloat(selectedPinjaman?.jumlah_pinjaman)
                                    ? <FaTimesCircle style={{ color: "red" }} />
                                    : <FaCheckCircle style={{ color: "green" }} />
                                    
                                  // : <p>Loading...</p>
                              }
                            </td>
                          </tr> */}

                          <tr>
                            <td className="text-left">Masih ada plafond tersisa</td>
                            <td className="text-center">
                              {jumlahPlafondSaatIni !== null && jumlahPlafondSaatIni !== undefined && selectedPinjaman?.jumlah_pinjaman !== undefined ? (
                                parseFloat(jumlahPlafondSaatIni) >= 0 ? (
                                  <FaCheckCircle style={{ color: "green" }} />
                                ) : (
                                  <FaTimesCircle style={{ color: "red" }} />
                                )
                              ) : (
                                <p>Loading...</p>
                              )}
                            </td>
                          </tr>

                          <tr>
                            <td className="text-left">Angsuran maksimal 20% Gaji Pokok</td>
                            <td className="text-center">
                            {selectedPinjaman?.jumlah_pinjaman && selectedPinjaman?.Peminjam.gaji_pokok ? (
                              calculaterasio_angsuran(
                                selectedPinjaman.jumlah_pinjaman,
                                selectedPinjaman.Peminjam.gaji_pokok
                              ) <= 20 ? (
                                <FaCheckCircle style={{ color: "green" }} />
                              ) : (
                                <FaTimesCircle style={{ color: "red" }} />
                              )
                            ) : (
                              <p>Loading...</p>
                            )}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left">Jarak pensiun >= 6 tahun</td>
                            <td className="text-center">
                              {
                              selectedPinjaman?.Peminjam.tanggal_lahir && selectedPinjaman?.Peminjam.jenis_kelamin
                              ? calculatePensiun(selectedPinjaman.Peminjam.tanggal_lahir, selectedPinjaman.Peminjam.jenis_kelamin) >= 6
                                ? <FaCheckCircle style={{ color: 'green' }} />
                                : <FaTimesCircle style={{ color: 'red' }} />  
                              : null 
                              } 
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>

                    <Col md="3">
                      <Button
                        className="btn-fill pull-right mb-5 btn-reset"
                        type="submit"
                        variant="warning">
                        <FaHistory style={{ marginRight: '8px' }} />
                        Reset
                      </Button>
                    </Col>

                    
                  </Row>

                  <div className="clearfix"></div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ScreeningKaryawan;