import React, { useState, useEffect, useMemo } from "react";
import AcceptedAlert from "components/Alert/AcceptedAlert.js";
import DeclineAlert from "components/Alert/DeclineAlert.js";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaCheckCircle, FaTimesCircle, FaHistory} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";
import Heartbeat from "./Heartbeat.js";


const BASE_URL = 'http://10.70.10.157:5000';
export const fetchHistoryPinjaman = async (idPeminjam) => {
  return axios.get(`${BASE_URL}/history-pinjaman/${idPeminjam}`, {
    headers: {
      Authorization: `Bearer ${token}`,
  },
  });
};

// react-bootstrap components
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col, 
  Table,
  FormControl
} from "react-bootstrap";

function ScreeningPinjamanKaryawan() {
  const [selectedPinjaman, setSelectedPinjaman] = useState(null);

  const [keperluan, setKeperluan] = useState(''); 
  const [id_karyawan, setIdKaryawan] = useState(""); 
  const [nama, setNama] = useState("");
  const [tanggal_masuk, setTanggalMasuk] = useState("");
  const [tanggal_lahir, setTanggalLahir] = useState(""); 
  const [masaKerja, setMasaKerja] = useState("");
  const [jarakPensiun, setJarakPensiun] = useState(""); 
  const [departemen, setDepartemen] = useState(""); 
  const [jenis_kelamin, setJenisKelamin] = useState(""); 
  const [gajiPokok, setGajiPokok] = useState(''); 
  const [jumlah_pinjaman, setJumlahPinjaman] = useState('');

  const [totalSudahDibayar, setTotalSudahDibayar] = useState(0);  
  const [belumDibayar, setBelumDibayar] = useState('');  
  const [pinjaman, setPinjaman] = useState([]); 
 
  const [rasio_angsuran, setrasio_angsuran] = useState(null);
  const [totalPinjaman, setTotalPinjaman] = useState(0); 
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState('');
  const [plafondTersedia, setPlafondTersedia] = useState(null);
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 

  const token = localStorage.getItem("token");

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

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
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (selectedPinjaman) {
      setKeperluan(selectedPinjaman.keperluan); 
    }

    calculaterasio_angsuran();
  }, [selectedPinjaman]);

  useEffect(() => {
    const fetchData = async () => {
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
          axios.get(`http://10.70.10.157:5000/plafond-saat-ini?jumlah_pinjaman=${jumlah_pinjaman || 0}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const totalSudahDibayar = responseTotalSudahDibayar.data.total_sudah_dibayar || 0;
        setTotalSudahDibayar(totalSudahDibayar);

        const totalPinjaman = responseTotalPinjaman.data.total_pinjaman || 0;
        setTotalPinjaman(totalPinjaman);
  
        const totalPinjamanKeseluruhan = responseTotalJumlahPinjaman.data.totalPinjamanKeseluruhan || 0;
        setTotalPinjamanKeseluruhan(totalPinjamanKeseluruhan);

        const plafondTersedia = responsePlafond.data.plafondSaatIni || 0;
        setPlafondTersedia(plafondTersedia);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (selectedPinjaman?.id_peminjam) {
      fetchData();
    }

    fetchUserData();
    const fetchDataKaryawan = async () => {
      if (!userData.id_karyawan) {
        console.error("ID Karyawan tidak tersedia.");
        return;
      }
  
      try {
        const responseKaryawan = await axios.get(`${BASE_URL}/karyawan/${userData.id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const karyawanData = responseKaryawan.data;

        if (!karyawanData) {
          console.error("Data karyawan tidak tersedia.");
          return;
        }
  
        const plafondResponse = await axios.get(`http://10.70.10.157:5000/plafond-saat-ini?jumlah_pinjaman=${jumlah_pinjaman || 0}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const plafondTersedia = plafondResponse.data.plafondSaatIni || null;
        setPlafondTersedia(plafondTersedia);
  
        const pinjamanResponse = await axios.get(`http://10.70.10.157:5000/pinjaman/total-pinjaman/${karyawanData.id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const pinjamanData = pinjamanResponse.data || {};
  
        if (pinjamanData && karyawanData.id_karyawan === pinjamanData.id_peminjam) {
          setSelectedPinjaman(pinjamanData);
        }
  
        const formatTanggal = (tanggal) => {
          if (!tanggal) return "";
          const parts = tanggal.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
          }
          return tanggal;
        };
  
        const formattedTanggalMasuk = formatTanggal(karyawanData.tanggal_masuk);
  
        setIdKaryawan(karyawanData.id_karyawan);
        setNama(karyawanData.nama);
        setTanggalMasuk(formattedTanggalMasuk || "");
        setDepartemen(karyawanData.departemen);
        setGajiPokok(karyawanData.gaji_pokok);
        setJenisKelamin(karyawanData.jenis_kelamin);
        setTanggalLahir(karyawanData.tanggal_lahir);
  
        const masaKerja = calculateYearsAndMonth(formattedTanggalMasuk);
        const jarakPensiun = calculatePensiun(karyawanData.tanggal_lahir, karyawanData.jenis_kelamin);
  
        setMasaKerja(masaKerja);
        setJarakPensiun(jarakPensiun);
  
      } catch (error) {
        console.error("Error fetching karyawan data:", error);
        // alert("Data karyawan tidak ditemukan atau terjadi kesalahan.");
      }
    };
  
    if (userData?.id_karyawan) {
      fetchDataKaryawan();
    }

  }, [userData.id_karyawan, selectedPinjaman?.id_peminjam]);

  // userData.id_karyawan, token, selectedPinjaman?.id_peminjam, userData
  

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

const processJumlahAngsuran = (value) => {
  const numericValue = parseInt(value.replace(/\./g, ''), 10);

  const modifiedValue = Math.floor(numericValue / 10);

  const roundedValue = Math.ceil(modifiedValue / 1000) * 1000;

  return roundedValue;
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

const calculatePensiun = (tanggal_lahir, jenisKelamin) => {
  const currentYear = new Date().getFullYear(); 
  const startYear = new Date(tanggal_lahir).getFullYear(); 

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


const calculaterasio_angsuran = () => {
  const keperluan = selectedPinjaman?.keperluan;
  const pinjamanValid = jumlah_pinjaman > 0;
  const keperluanValid = keperluan !== null && keperluan !== "";

  if (pinjamanValid && keperluanValid) {
    const angsuranBulanan = jumlah_pinjaman / 60; 
    // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10; 
    const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100)
    setrasio_angsuran(rasio_angsuran.toFixed(2));
  } else {
    setrasio_angsuran(null);
  }
};


const handleJumlahPinjamanChange = (value) => {
  const numericValue = value.replace(/\D/g, "");
  setJumlahPinjaman(numericValue);
};

const calculaterasio_angsuranMemoized = useMemo(() => {
  if (!jumlah_pinjaman || !gajiPokok) return null; 
  const angsuranBulanan = jumlah_pinjaman / 60;
  // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10;
  const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100)
  return parseFloat(rasio_angsuran.toFixed(2));

  // console.log(
  //   "Rasio angsuran:",
  //   calculaterasio_angsuran(jumlah_pinjaman, gajiPokok)
  // );
}, [jumlah_pinjaman, gajiPokok]);

const calculateAngsuranBulananMemoized = useMemo(() => {
  if (!jumlah_pinjaman || !gajiPokok) return null; 

  const angsuranBulanan = jumlah_pinjaman / 60;
  return parseFloat(angsuranBulanan.toFixed(2)); 
}, [jumlah_pinjaman, gajiPokok]);

const isDataComplete = () => {
  return (
    tanggal_masuk &&
    totalPinjaman !== undefined &&
    totalSudahDibayar !== undefined &&
    plafondTersedia !== null &&
    jumlah_pinjaman !== undefined &&
    gajiPokok !== undefined &&
    tanggal_lahir &&
    jenis_kelamin && 
    keperluan !== null &&
    rasio_angsuran !== null
  );
};

const hasilScreening = React.useMemo(() => {
  if (!isDataComplete()) return null;

  const isDeclined =
    calculateYears(tanggal_masuk) < 5 ||
    totalPinjaman - totalSudahDibayar !== 0 ||
    calculaterasio_angsuran(jumlah_pinjaman, gajiPokok) > 20 ||
    rasio_angsuran > 20 ||
    calculatePensiun(tanggal_lahir, jenis_kelamin) < 6 ||
    parseFloat(plafondTersedia) < parseFloat(jumlah_pinjaman);

  return isDeclined ? "Decline" : "Accepted";
}, [
  tanggal_masuk,
  totalPinjaman,
  totalSudahDibayar,
  plafondTersedia,
  jumlah_pinjaman,
  gajiPokok,
  tanggal_lahir,
  jenis_kelamin,
  keperluan,
  rasio_angsuran
]);
  return (
    <>
    <Heartbeat />
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
                <span className="text-danger required-select">(*) Wajib diisi.</span>
                  <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>ID Karyawan</label>
                        <Form.Control
                          // disabled
                          placeholder="ID Karyawan"
                          type="text"
                          value={id_karyawan}
                          readOnly
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
                          readOnly
                          value={nama || ""}
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
                          readOnly
                          value={tanggal_masuk || ""}
                        ></Form.Control>
                    </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md--0" md="6">
                      <Form.Group>
                        <label>Masa Kerja</label>
                        <Form.Control
                          placeholder="Th"
                          type="text"
                          readOnly
                          value={masaKerja}
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
                            value={jarakPensiun + " Tahun"}
                          ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <Form.Group>
                        <label>Departemen</label>
                        <FormControl 
                        placeholder="Departemen"
                        type="text"
                        readOnly
                        value={departemen}
                        >
                        </FormControl>
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
                          readOnly
                          value={formatRupiah(gajiPokok)}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md-1" md="6">
                      <Form.Group>
                      <span className="text-danger">*</span>
                        <label>Jumlah Pinjaman</label>
                        <Form.Control
                          placeholder="Rp"
                          type="text"
                          required
                          value={formatRupiah(jumlah_pinjaman)}
                          onChange={(e) => handleJumlahPinjamanChange(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col className="pl-md-1" md="6">
                      <Form.Group>
                      <span className="text-danger">*</span>
                        <label>Keperluan</label>
                        <Form.Select 
                          className="form-control"
                          required
                          value={selectedPinjaman?.keperluan || ""} 
                          onChange={(e) => {
                            const newKeperluan = e.target.value;
                            setSelectedPinjaman((prev) => ({
                              ...prev,
                              keperluan: newKeperluan,
                            }));
                          }} 
                        >
                          <option className="placeholder-form" key="blankChoice" hidden value="">
                            Pilih Jenis Keperluan
                          </option>
                          <option value="Pendidikan">Pendidikan</option>
                          <option value="Pengobatan">Pengobatan</option>
                          <option value="Renovasi">Renovasi</option>
                        </Form.Select>
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
                          value={rasio_angsuran !==null ? `${rasio_angsuran} %` : ""}
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
                    <label>Hasil Screening</label>
                      <br />
                      {isDataComplete() ? (
                        hasilScreening === "Decline" ? (
                         <>
                            <DeclineAlert/>
                            {/* {console.log('Hasil screening: Decline')} */}
                          </>
                        ) : (
                          <AcceptedAlert
                            selectedPinjaman={selectedPinjaman}
                            totalPinjaman={totalPinjaman}
                            totalSudahDibayar={totalSudahDibayar}
                          />
                        )
                      ) : (
                        <p className="text-danger">*Mohon lengkapi semua data terlebih dahulu.</p>
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
                                tanggal_masuk
                                ? calculateYears(tanggal_masuk) >=5 
                                ? <FaCheckCircle style={{ color: 'green' }} />
                                : <FaTimesCircle style={{ color: 'red' }} />
                                : null
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left">Tidak memiliki pinjaman aktif</td>
                            <td className="text-center">
                            {
                              id_karyawan ? ( 
                                totalPinjaman - totalSudahDibayar !== 0 
                                ? <FaTimesCircle style={{ color: 'red' }} /> 
                                : <FaCheckCircle style={{ color: 'green' }} />
                              ) : null}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left">Masih ada plafond tersisa</td>
                            <td className="text-center">
                              {
                                id_karyawan ? (
                                  calculateAngsuranBulananMemoized !== null ? (
                                    parseFloat(plafondTersedia) >= parseFloat(jumlah_pinjaman) ? (
                                      <FaCheckCircle style={{ color: "green" }} />
                                    ) : (
                                      <FaTimesCircle style={{ color: "red" }} />
                                    )
                                  ) : (
                                    <p>Loading...</p>
                                  )
                                ) : null
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left">Angsuran maksimal 20% Gaji Pokok</td>
                            <td className="text-center">
                            {
                              id_karyawan ? (
                                calculaterasio_angsuranMemoized !== null ? (
                                  calculaterasio_angsuranMemoized <= 20 ? (
                                    <FaCheckCircle style={{ color: "green" }} />
                                  ) : (
                                    <FaTimesCircle style={{ color: "red" }} />
                                  )
                                ) : (
                                  <p>Loading...</p>
                                )
                              ) : null
                            }
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left">Jarak pensiun >= 6 tahun</td>
                            <td className="text-center">
                              {
                                tanggal_lahir && jenis_kelamin
                                ? calculatePensiun(tanggal_lahir, jenis_kelamin) >= 6
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
                        className="btn-fill pull-right mt-4 btn-reset"
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

export default ScreeningPinjamanKaryawan;
