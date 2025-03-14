import React, { useState, useEffect, useMemo } from "react";
import AcceptedAlert from "components/Alert/AcceptedAlert.js";
import DeclineAlert from "components/Alert/DeclineAlert.js";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaCheckCircle, FaTimesCircle, FaHistory} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";
import {toast } from 'react-toastify';


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
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col, 
  Table,
  FormControl
} from "react-bootstrap";

function ScreeningKaryawanManual() {
  const location = useLocation();
  // const { selectedPinjaman } = location.state || {};
  const [selectedPinjaman, setSelectedPinjaman] = useState(null);

  const [keperluan, setKeperluan] = useState(''); 
  const [id_peminjam, setIdPeminjam] = useState("");
  const [id_karyawan, setIdKaryawan] = useState(""); 
  const [nama, setNama] = useState("");
  const [tanggal_masuk, setTanggalMasuk] = useState("");
  const [tanggal_lahir, setTanggalLahir] = useState(""); 
  const [masaKerja, setMasaKerja] = useState("");
  const [jarakPensiun, setJarakPensiun] = useState(""); 
  const [departemen, setDepartemen] = useState(""); 
  const [jenis_kelamin, setJenisKelamin] = useState(""); 
  const [gajiPokok, setGajiPokok] = useState(''); 
  const [jumlah_pinjaman, setJumlahPinjaman] = useState("");

  const [totalSudahDibayar, setTotalSudahDibayar] = useState(0);  
  const [belumDibayar, setBelumDibayar] = useState('');  
  const [pinjaman, setPinjaman] = useState([]); 
  // const [setSelectedPinjaman] = useState([]);
 
  const [rasio_angsuran, setrasio_angsuran] = useState(null);
  const [totalPinjaman, setTotalPinjaman] = useState(0); 
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState('');
  const [plafond, setPlafond] = useState([]); 
  const [selectedPlafond, setSelectedPlafond] = useState(null); 
  const [plafondTersedia, setPlafondTersedia] = useState('');
  const plafondTersediaNumber = parseFloat(plafondTersedia);
  const jumlahPinjamanNumber = parseFloat(selectedPinjaman?.jumlah_pinjaman);
  const [isDeclined, setIsDeclined] = useState(false);
  const history = useHistory();
  const [screeningResult, setScreeningResult] = useState(null); 

  const token = localStorage.getItem("token");

  // useEffect(() => {
  //   if (selectedPinjaman) {
  //     setKeperluan(selectedPinjaman.keperluan); 
  //   }
  // }, [selectedPinjaman]);

  useEffect(() => {
    toast.dismiss();
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gunakan Promise.all untuk mengambil semua data secara bersamaan
        const [
          responseTotalSudahDibayar,
          responseTotalPinjaman,
          responseTotalJumlahPinjaman,
          responsePlafond,
        ] = await Promise.all([
          // axios.get(`http://10.70.10.157:5000/karyawan/${selectedPinjaman?.id_peminjam}`), 
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
          // axios.get("http://10.70.10.157:5000/plafond-tersedia"),
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

        // performScreening();

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    if (selectedPinjaman?.id_peminjam) {
      fetchData();
    }

    calculaterasio_angsuran();
  }, [selectedPinjaman]);

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
  // let months = currentYear.getMonth() - startYear.getMonth(); 

  // if (months < 0) {
  //   years -= 1;
  //   months += 12;
  // }
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
    const angsuranBulanan = jumlah_pinjaman / 60; // Contoh tenor 60 bulan
    // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10; // Dalam persentase
    const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100);
    setrasio_angsuran(rasio_angsuran.toFixed(2));
  } else {
    setrasio_angsuran(null);
  }
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

// console.log("Total belum dibayar:", totalBelumDibayar);

const handleIdKaryawanChange = (value) => {
  const numericValue = value.replace(/\D/g, "");
  setIdKaryawan(numericValue);
};

const handleJumlahPinjamanChange = (value) => {
  const numericValue = value.replace(/\D/g, "");
  setJumlahPinjaman(numericValue);
};

const handleIdKaryawanKeyPress = async (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); 
    if (id_karyawan) {
      try {
        const responseKaryawan = await axios.get(`${BASE_URL}/karyawan/${id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        const karyawanData = responseKaryawan.data;
        // console.log("Karyawan response: ", karyawanData);
        // console.log("Karyawan id: ", karyawanData.id_karyawan);

        // if (!karyawanData) {
        //   console.error("Data karyawan tidak ditemukan.");
        //   return;
        // }

        const plafondResponse = await axios.get("http://10.70.10.157:5000/plafond-tersisa", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        const plafondTersedia = plafondResponse.data.plafondTersedia;
        setPlafondTersedia(plafondTersedia);
        // console.log("Plafond tersedia:", plafondTersedia);


        const pinjamanResponse = await axios.get(`http://10.70.10.157:5000/pinjaman/total-pinjaman/${karyawanData.id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        const pinjamanData = pinjamanResponse.data || {};
        // console.log("Pinjaman data: ", pinjamanData);

        if (pinjamanData && karyawanData.id_karyawan === pinjamanData.id_peminjam ) {
          setSelectedPinjaman(pinjamanData); 
          // console.log("Pinjaman data:", pinjamanData);
         
        }

        const formatTanggal = (tanggal) => {
          if (!tanggal) return ""; // Menghindari error jika tanggal null/undefined
          const parts = tanggal.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
          }
          return tanggal; // Jika format sudah benar, langsung dikembalikan
        };

        const formattedTanggalMasuk = formatTanggal(karyawanData.tanggal_masuk);
        // console.log("Formatted Tanggal Masuk:", formattedTanggalMasuk);

        // Set data ke state
        setNama(karyawanData.nama);
        setTanggalMasuk(formattedTanggalMasuk || "");
        setDepartemen(karyawanData.departemen);
        setGajiPokok(karyawanData.gaji_pokok);
        setJenisKelamin(karyawanData.jenis_kelamin);
        setTanggalLahir(karyawanData.tanggal_lahir); 


        // Hitung masa kerja dan jarak pensiun
        const masaKerja = calculateYearsAndMonth(formattedTanggalMasuk);
        const jarakPensiun = calculatePensiun(karyawanData.tanggal_lahir, karyawanData.jenis_kelamin);

        setMasaKerja(masaKerja);
        setJarakPensiun(jarakPensiun);

        // console.log("Karyawan Data:", karyawanData);

        setPlafondTersedia(plafondTersedia);
        // console.log("Plafond tersedia:", plafondTersedia);


      } catch (error) {
        console.error("Error fetching karyawan data:", error);
        alert("Data karyawan tidak ditemukan atau terjadi kesalahan.");
      }
    } else {
      alert("ID Karyawan tidak boleh kosong.");
    }
  }
};

const calculaterasio_angsuranMemoized = useMemo(() => {
  if (!jumlah_pinjaman || !gajiPokok) return 0; // Pastikan input valid untuk menghindari error
  
  // console.log("Jumlah pinjaman: ", jumlah_pinjaman);
  // console.log("Gaji pokok: ", gajiPokok);

  // Hitung angsuran bulanan berdasarkan tenor 60 bulan
  const angsuranBulanan = jumlah_pinjaman / 60;
  // Hitung rasio angsuran dalam bentuk persentase
  // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10;
  const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100)

  // console.log("Angsuran bulanan: ", angsuranBulanan);
  // console.log("Rasio angsuran (persentase): ", rasio_angsuran);

  // Return rasio angsuran sebagai angka, bukan string
  return parseFloat(rasio_angsuran.toFixed(2)); // 2 desimal untuk presisi

  // console.log(
  //   "Rasio angsuran:",
  //   calculaterasio_angsuran(jumlah_pinjaman, gajiPokok)
  // );
}, [jumlah_pinjaman, gajiPokok]);

const calculateAngsuranBulananMemoized = useMemo(() => {
  if (!jumlah_pinjaman || !gajiPokok) return null; // Pastikan input valid untuk menghindari error
  
  // console.log("Jumlah pinjaman: ", jumlah_pinjaman);
  // console.log("Gaji pokok: ", gajiPokok);

  // Hitung angsuran bulanan berdasarkan tenor 60 bulan
  const angsuranBulanan = jumlah_pinjaman / 60;

  // console.log("Angsuran bulanan: ", angsuranBulanan);

  // Return rasio angsuran sebagai angka, bukan string
  return parseFloat(angsuranBulanan.toFixed(2)); // 2 desimal untuk presisi

  // console.log(
  //   "Rasio angsuran:",
  //   calculaterasio_angsuran(jumlah_pinjaman, gajiPokok)
  // );
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

  const plafondTersediaParsed = parseFloat(plafondTersedia);
  const jumlahPinjamanParsed = parseFloat(jumlah_pinjaman);

  const isDeclined =
    calculateYears(tanggal_masuk) < 5 ||
    totalPinjaman - totalSudahDibayar !== 0 ||
    calculaterasio_angsuran(jumlah_pinjaman, gajiPokok) > 20 ||
    rasio_angsuran > 20 ||
    calculatePensiun(tanggal_lahir, jenis_kelamin) < 6 ||
    plafondTersediaParsed < jumlahPinjamanParsed;

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
                <span className="text-danger required-select">(*) Wajib Diisi</span>
                <br/><span className="text-danger required-select">Enter untuk menampilkan angsuran per bulan dan hasil pembulatan</span>

                  <Row>
                    <Col md="12">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>ID Karyawan</label>
                        <Form.Control
                          // disabled
                          placeholder="ID Karyawan"
                          type="text"
                          required
                          value={id_karyawan}
                          onChange={(e) => handleIdKaryawanChange(e.target.value)}
                          onKeyPress={handleIdKaryawanKeyPress}
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
                          value={nama}
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
                        {/* <Form.Select className="form-control"  value={selectedPinjaman?.Peminjam.departemen}>
                          <option className="placeholder-form" key='blankChoice' hidden value>Pilih Departemen</option>
                          <option value="Finance and Administration">Finance and Administration</option>
                          <option value="Quality Control">Quality Control</option>
                          <option value="Quality Assurance">Quality Assurance</option>
                          <option value="Human Resources">Human Resources</option>
                        </Form.Select> */}
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
                          value={selectedPinjaman?.keperluan || ""} // Tambahkan fallback untuk menghindari error saat nilai awal undefined
                          onChange={(e) => {
                            const newKeperluan = e.target.value;
                            setSelectedPinjaman((prev) => ({
                              ...prev,
                              keperluan: newKeperluan,
                            }));
                          }} // Pastikan `setSelectedPinjaman` terdefinisi
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
                          {/* {parseFloat(plafondTersedia) < parseFloat(jumlah_pinjaman) ? (
                            <DeclineAlert plafondTersedia={parseFloat(plafondTersedia)} />
                          ) : ( */}
                            <DeclineAlert/>
                          {/* )} */}
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

export default ScreeningKaryawanManual;