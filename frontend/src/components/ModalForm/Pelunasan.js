import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const Pelunasan = ({ showPelunasanModal, setShowPelunasanModal, angsuran, onSuccess }) => {
    const [id_angsuran, setIdAngsuran] = useState(""); 
    const [tanggal_angsuran, setTanggalAngsuran] = useState(""); 
    const [id_peminjam, setIdPeminjam] = useState("");
    const [nama, setNama] = useState("");
    const [id_pinjaman, setIdPinjaman] = useState("");
    const [jumlah_angsuran, setJumlahAngsuran] = useState("");
    const [jumlah_pinjaman, setJumlahPinjaman] = useState("");
    const [bulan_angsuran, setBulanAngsuran] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [sudahDibayar, setSudahDibayar] = useState(""); 
    const [belum_dibayar, setBelumDibayar] = useState(""); 
    const [karyawanData, setKaryawanData] = useState([]); 
    const [selectedJumlahPelunasanBulan, setSelectedJumlahPelunasanBulan] = useState(); 
    const [AngsuranPinjaman, setAngsuranPinjaman] = useState([]); 
    const [jumlah_angsuran_real, setJumlahAngsuranReal] = useState([]); 
    const [sisaAngsuranBulan, setSisaAngsuranBulan] = useState(0);
    const [status, setStatus] = useState("Belum Lunas"); 


    const token = localStorage.getItem("token");

    useEffect(() => {
        getKaryawanData();
        if (angsuran) {
            // If angsuran data exists, fill the form fields with that data
            setIdAngsuran(angsuran.id_angsuran);
            setTanggalAngsuran(angsuran.tanggal_angsuran);
            setIdPeminjam(angsuran.id_peminjam);
            setNama(angsuran.KaryawanPeminjam ? angsuran.KaryawanPeminjam.nama : 'N/A');
            setIdPinjaman(angsuran.id_pinjaman);
            setJumlahAngsuran(angsuran.jumlah_angsuran);
            setJumlahPinjaman(angsuran.jumlah_pinjaman);
            setBulanAngsuran(angsuran.bulan_angsuran);
            setKeterangan(angsuran.keterangan);
            setSisaAngsuranBulan(60 - angsuran.bulan_angsuran);
            setJumlahAngsuranReal(angsuran.AngsuranPinjaman?.jumlah_angsuran || 0);
            setSudahDibayar(angsuran.sudah_dibayar); 
            setBelumDibayar(angsuran.belum_dibayar); 
            setStatus(angsuran.status);
    
        }
        const today = new Date().toISOString().split("T")[0];
        setTanggalAngsuran(today); 
    }, [angsuran]);

    const getKaryawanData = async () => {
        try {
            const response = await axios.get("http://10.70.10.157:5000/karyawan-data", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setKaryawanData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error.message); 
        }
    };

    const getPinjamanData = async (idPinjaman) => {
        try {
            const response = await axios.get(`http://10.70.10.157:5000/pinjaman/${idPinjaman}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAngsuranPinjaman(response.data);
        } catch (error) {
            console.error("Error fetching pinjaman data:", error.message); 
        }
    };

    useEffect(() => {
        if (id_pinjaman) {
            getPinjamanData(id_pinjaman);
        }
    }, [id_pinjaman]);

    const savePelunasan = async (e) => {
        e.preventDefault();
        try {
            if (!selectedJumlahPelunasanBulan) {
                return alert("Pilih jumlah bulan pelunasan terlebih dahulu.");
            }
    
            const totalAngsuran = selectedJumlahPelunasanBulan * (AngsuranPinjaman?.jumlah_angsuran || 0);
            const updatedBelumDibayar = Math.max(0, belum_dibayar - totalAngsuran);
            const statusBaru = updatedBelumDibayar <= 0 ? 'Lunas' : 'Belum Lunas';
    
            const data = {
                tanggal_angsuran,
                id_peminjam,
                id_pinjaman,
                sudah_dibayar: totalAngsuran,
                belum_dibayar: updatedBelumDibayar,
                status: statusBaru,
                sudah_dihitung: true,
                bulan_angsuran: bulan_angsuran + selectedJumlahPelunasanBulan,
                keterangan,
                jumlah_pinjaman,
            };
    
            const response = await axios.post('http://10.70.10.157:5000/angsuran', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                toast.success('Data pelunasan berhasil disimpan', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                });
            }

            if (statusBaru === 'Lunas') {
                const updatePinjamanResponse = await axios.put(
                    `http://10.70.10.157:5000/pinjaman/${id_pinjaman}/status`,
                    { status_pelunasan: statusBaru },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );   
            } 
    
        } catch (error) {
            console.error("Error:", error.message);
            toast.error('Gagal menambahkan data pelunasan.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
        window.location.reload();
    };
    
    const formatRupiah = (angka) => {
        if (angka == null || angka === "") return ""; // Handle nilai null atau kosong
        
        let numberString = angka.toString().replace(/\D/g, ""); // Hapus karakter selain angka
        let sisa = numberString.length % 3;
        let rupiah = numberString.substr(0, sisa);
        let ribuan = numberString.substr(sisa).match(/\d{3}/g);
      
        if (ribuan) {
            let separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }
      
        return rupiah || ""; 
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

      const formattedTanggalAngsuran = formatTanggal(tanggal_angsuran);

    return (
        <>
            {/* Mini Modal */}
            <Modal
                className="modal-primary"
                show={showPelunasanModal}
                onHide={() => setShowPelunasanModal(false)}
            >
                <Modal.Header className="text-center">
                    <h3>Form Pelunasan Pinjaman Karyawan</h3>
                </Modal.Header>
                <Modal.Body className="text-left">
                    <hr />
                    <Form onSubmit={savePelunasan}> 
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>ID Angsuran</label>
                                    <Form.Control
                                        placeholder="ID Angsuran"
                                        type="text"
                                        value={id_angsuran}
                                        onChange={(e) => setIdAngsuran(e.target.value)}
                                        disabled={true}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Tanggal Angsuran</label>
                                    <Form.Control
                                        placeholder="Tanggal Angsuran"
                                        value={formattedTanggalAngsuran}
                                        type="text"
                                        readOnly
                                        onChange={(e) => setTanggalAngsuran(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>ID Karyawan</label>
                                    <Form.Control
                                        placeholder="ID Karyawan"
                                        type="text"
                                        disabled
                                        value={id_peminjam}
                                    />
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
                                        disabled
                                        value={nama}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>ID Pinjaman</label>
                                    <Form.Control
                                        placeholder="ID Pinjaman"
                                        type="text"
                                        disabled
                                        value={id_pinjaman}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Jumlah Angsuran</label>
                                    <Form.Control
                                        placeholder="Jumlah Angsuran"
                                        type="text"
                                        disabled
                                        value={formatRupiah(jumlah_angsuran_real)}
                                        onChange={(e) => setJumlahAngsuranReal(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Sisa Angsuran (Bulan)</label>
                                    <Form.Control
                                        placeholder="Sisa Angsuran"
                                        type="text"
                                        disabled
                                        value={sisaAngsuranBulan}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                            <Form.Group>
                                <label>Jumlah Pelunasan (Bulan)</label>
                                <Form.Select 
                                    className="form-control" 
                                    disabled={sisaAngsuranBulan === 0}
                                    value={selectedJumlahPelunasanBulan}
                                    onChange={(e) => setSelectedJumlahPelunasanBulan(parseInt(e.target.value))}
                                >
                                     <option className="placeholder-form" key='blankChoice' hidden value>Pilih Jumlah Pelunasan (Bulan)</option>
                                    {[...Array(sisaAngsuranBulan)].map((_, i) => {
                                        const optionValue = (i + 1);
                                        return optionValue <=  sisaAngsuranBulan
                                            ? <option key={optionValue} value={optionValue}>
                                                {optionValue}
                                            </option>
                                            : null;
                                    })}
                                </Form.Select>
                            </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Total Angsuran</label>
                                    <Form.Control
                                        placeholder="Total Angsuran"
                                        type="text"
                                        disabled
                                        value={formatRupiah(selectedJumlahPelunasanBulan * (AngsuranPinjaman?.jumlah_angsuran || 0))}
                                        onChange={(e) => setSudahDibayar(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Keterangan</label>
                                    <Form.Control
                                        placeholder="Keterangan"
                                        value={keterangan}
                                        as="textarea"
                                        onChange={(e) => setKeterangan(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Button className="btn-fill pull-right primary w-100 mt-3" variant="primary" type="submit">
                                    Simpan Pelunasan
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Pelunasan;
