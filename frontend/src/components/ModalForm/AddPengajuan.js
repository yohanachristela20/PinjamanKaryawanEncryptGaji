import { Badge, Button, Modal, Form, Row, Col } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddPengajuan = ({ showAddModal, setShowAddModal, onSuccess }) => {
    const [id_pinjaman, setIdPinjaman] = useState("");
    const [tanggal_pengajuan, setTanggalPengajuan] = useState("");
    const [jumlah_pinjaman, setJumlahPinjaman] = useState("");
    const [jumlah_angsuran, setJumlahAngsuran] = useState("");
    const [pinjaman_setelah_pembulatan, setJumlahPinjamanSetelahPembulatan] = useState("");
    const [nomorAntrean, setNomorAntrean] = useState("");
    const [keperluan, setKeperluan] = useState("");
    const [status_pengajuan, setStatusPengajuan] = useState("Ditunda"); 
    const [status_transfer, setStatusTransfer] = useState("Ditunda");
    const [selectedPinjaman, setSelectedPinjaman] = useState(""); 
    const [id_peminjam, setIdPeminjam] = useState(""); 
    const [pinjaman, setPinjaman] = useState("");
    const [antrean, setAntrean] = useState("");
    
    const token = localStorage.getItem("token");
    const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 

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
    
    const fetchLatestIdPengajuan = async () => {
        try {
            const response = await axios.get('http://10.70.10.157:5000/pinjaman/latest-id', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const latestId = response.data.latestId;
            const newId = `P${String(parseInt(latestId.slice(1)) + 1).padStart(5, '0')}`; 
            setIdPinjaman(newId);
            // console.log("Latest id pinjaman: ", newId);
        } catch (error) {
            console.log("Error fetching latest ID:", error.message);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            if (jumlah_pinjaman) {
                let angsuranBulanan = parseFloat(jumlah_pinjaman) / 60;

                let angsuranBulananNew = Math.ceil(angsuranBulanan / 1000) * 1000;

                let pinjamanSetelahPembulatan = parseFloat(angsuranBulananNew) * 60;

                let pinjamanSetelahPembulatanNew = Math.ceil(pinjamanSetelahPembulatan / 1000) * 1000;

                setJumlahAngsuran(angsuranBulananNew);
                setJumlahPinjamanSetelahPembulatan(pinjamanSetelahPembulatanNew);
            } else {
                setJumlahAngsuran("");
                setJumlahPinjamanSetelahPembulatan(""); 
            }
        }
    };

    const formatTanggal = (tanggal) => {
        if (!tanggal) return "";
        const parts = tanggal.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month}-${day}`;
        }
        return tanggal;
      };
    

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username");
            if (!token || !username) return;
      
            try {
              const response = await axios.get(`http://10.70.10.157:5000/user-details/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
      
              if (response.data) {
                setUserData({
                  id_karyawan: response.data.id_karyawan,
                  nama: response.data.nama,
                  divisi: response.data.divisi,
                });
                setIdPeminjam(response.data.id_karyawan); 
                // console.log("User data fetched:", response.data);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          };
      
        fetchAntrean();
        fetchUserData();
        fetchLatestIdPengajuan();
        // calculateJumlahAngsuran();

        const today = new Date().toISOString().split("T")[0];
        setTanggalPengajuan(today); 
    }, []);

    const savePengajuan = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://10.70.10.157:5000/pinjaman', {
                id_pinjaman,
                tanggal_pengajuan,
                jumlah_pinjaman,
                jumlah_angsuran,
                pinjaman_setelah_pembulatan,
                keperluan,
                status_pengajuan, 
                status_transfer,
                id_peminjam,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowAddModal(false); 
            onSuccess(); 

        } catch (error) {
            console.log(error.message);
        }
    };

    const formatRupiah = (angka) => {
        let jumlahString = angka.toString().replace(/\D/g, "");
        let sisa = jumlahString.length % 3;
        let rupiah = jumlahString.substr(0, sisa);
        let ribuan = jumlahString.substr(sisa).match(/\d{3}/g);

        if (ribuan) {
            let separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }

        return rupiah;
    };

    const handleJumlahPinjamanChange = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setJumlahPinjaman(numericValue);
    };

    return (
        <>
        {/* <ToastContainer /> */}
            {/* Mini Modal */}
            
            <Modal
                className="modal-primary"
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
            >
                <Modal.Header className="text-center">
                    <h3>Form Pengajuan</h3>
                </Modal.Header>
                <Modal.Body className="text-left">
                    <hr />
                    <Form onSubmit={savePengajuan}>
                    <span className="text-danger required-select">(*) Wajib diisi.</span>
                    
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Tanggal Pengajuan</label>
                                    <Form.Control
                                        type="text"
                                        value={formatTanggal(tanggal_pengajuan)}
                                        required
                                        readOnly
                                        onChange={(e) => setTanggalPengajuan(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Jumlah Pinjaman</label>
                                    <Form.Control
                                        placeholder="Rp"
                                        type="text"
                                        required
                                        value={formatRupiah(jumlah_pinjaman || "")}
                                        onChange={(e) => handleJumlahPinjamanChange(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Jumlah Angsuran</label>
                                    <Form.Control
                                        placeholder="Rp"
                                        type="text"
                                        required
                                        readOnly
                                        value={formatRupiah(jumlah_angsuran || "")}

                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Jumlah Pinjaman Setelah Pembulatan</label>
                                    <Form.Control
                                        placeholder="Rp"
                                        type="text"
                                        required
                                        readOnly
                                        value={formatRupiah(pinjaman_setelah_pembulatan || "")}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Keperluan</label>
                                    <Form.Select 
                                    className="form-control"
                                    required
                                    value={keperluan || ""} 
                                    onChange={(e) => setKeperluan(e.target.value)}
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
                        <Row>
                            <Col md="12">
                                <div className="modal-footer d-flex flex-column">
                                    <Button className="btn-fill w-100 mt-3" type="submit" variant="primary">
                                        Simpan
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AddPengajuan;
