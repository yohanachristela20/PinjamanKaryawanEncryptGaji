import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const EditKaryawan = ({showEditModal, setShowEditModal, karyawan, onSuccess}) => {
    const [id_karyawan, setIdKaryawan] = useState("");
    const [nama, setNama] = useState("");
    const [jenis_kelamin, setJenisKelamin] = useState("");
    const [departemen, setDepartemen] = useState("");
    const [divisi, setDivisi] = useState("");
    const [tanggal_lahir, setTanggalLahir] = useState("");
    const [tanggal_masuk, setTanggalMasuk] = useState("");
    const [gaji_pokok, setGajiPokok] = useState("");

    const [jenisKelaminError, setJenisKelaminError] = useState(false);
    const [departemenError, setDepartemenError] = useState(false);
    const [divisiError, setDivisiError] = useState(false);
    const [tanggalError, setTanggalError] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (karyawan) {
            setIdKaryawan(karyawan.id_karyawan);
            setNama(karyawan.nama);
            setJenisKelamin(karyawan.jenis_kelamin);
            setDepartemen(karyawan.departemen);
            setDivisi(karyawan.divisi);
            setTanggalLahir(karyawan.tanggal_lahir);
            setTanggalMasuk(karyawan.tanggal_masuk);
            setGajiPokok(karyawan.gaji_pokok);
        }
    }, [karyawan]);

    

    const updateKaryawan = async(e) => {
        e.preventDefault();

        if (!jenis_kelamin) {
            setJenisKelaminError(true);
            e.preventDefault();
            return;
        } else if (!departemen) {
            setDepartemenError(true);
            e.preventDefault();
            return;
        } else if (!divisi) {
            setDivisiError(true);
            e.preventDefault();
            return; 
        } else if (tanggal_lahir && tanggal_masuk < tanggal_lahir) {
            setTanggalError(true);
            e.preventDefault();
            return; 
        }

        try {
            await axios.patch(`http://10.70.10.157:5000/karyawan/${karyawan.id_karyawan}`, {
                id_karyawan,
                nama, 
                jenis_kelamin,
                departemen,
                divisi,
                tanggal_lahir,
                tanggal_masuk,
                gaji_pokok: gaji_pokok.toString(),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
        } catch (error) {
            // console.log(error.message);
            toast.error('Gagal mengubah data karyawan.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

    const getKaryawanById = async () => {
        const response = await axios.get(`http://10.70.10.157:5000/karyawan/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setNama(response.data.nama);
        setJenisKelamin(response.data.jenis_kelamin);
        setDepartemen(response.data.departemen);
        setDivisi(response.data.divisi);
        setTanggalLahir(response.data.tanggal_lahir);
        setTanggalMasuk(response.data.tanggal_masuk);
        setGajiPokok(response.data.gaji_pokok);
    }

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
    
    const handleGajiPokokChange = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setGajiPokok(numericValue);
    };

    const handleIdKaryawanChange = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setIdKaryawan(numericValue);
    };

    const handleNamaChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNama(alphabetValue);
    };


    return (
        <>
            {/* Mini Modal */}
            <Modal
            className=" modal-primary"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            >
            <Modal.Header className="text-center">
                <h3>Form Edit Karyawan</h3>
                
            </Modal.Header>
            <Modal.Body className="text-left">
                <hr />
                <Form onSubmit={updateKaryawan}>
                <Row>
                <Col md="12">
                    <Form.Group>
                        <label>ID Karyawan</label>
                        <Form.Control
                            disabled
                            placeholder="ID Karyawan"
                            type="text"
                            required
                            value={id_karyawan}
                            onChange={(e) => handleIdKaryawanChange(e.target.value)}
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
                        required
                        value={nama}
                        uppercase
                        onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>

                <Row>
                <Col md="12">
                    <Form.Group>
                    <label>Jenis Kelamin</label>
                    <Form.Select 
                    className="form-control"
                    required
                    value={jenis_kelamin}
                    onChange={(e) => {
                        setJenisKelamin(e.target.value);
                        setJenisKelaminError(false); 
                    }}
                    >
                        <option className="placeholder-form" key='blankChoice' hidden value>Pilih Jenis Kelamin</option>
                        <option value="L">L</option>
                        <option value="P">P</option>
                    </Form.Select>
                    {jenisKelaminError && <span className="text-danger required-select">Jenis kelamin belum dipilih</span>}
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md="12">
                    <Form.Group>
                    <label>Departemen</label>
                    <Form.Select 
                    className="form-control"
                    required
                    value={departemen}
                    onChange={(e) => {
                        setDepartemen(e.target.value);
                        setDepartemenError(false); 
                        setDivisi("");
                    }}
                    >
                        <option className="placeholder-form" key='blankChoice' hidden value>Pilih Departemen</option>
                        <option value="DIREKSI">DIREKSI</option>
                        <option value="FINANCE & ADMINISTRATION">FINANCE & ADMINISTRATION</option>
                        <option value="PRODUCTION">PRODUCTION</option>
                        <option value="SALES & DISTRIBUTION">SALES & DISTRIBUTION</option>
                        <option value="GENERAL">GENERAL</option>
                    </Form.Select>
                    {departemenError && <span className="text-danger required-select">Departemen belum dipilih</span>}
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md="12">
                    <Form.Group>
                    <label>Divisi</label>
                    <Form.Select 
                    className="form-control"
                    value={divisi}
                    required
                    onChange={(e) => {
                        setDivisi(e.target.value);
                        setDivisiError(false); 
                    }}
                    disabled={!departemen}
                    >
                    <option className="placeholder-form" key='blankChoice' hidden value>Pilih Divisi</option>

                    {departemen === "DIREKSI" && <option value="DIREKSI">DIREKSI</option>}
                    {departemen === "FINANCE & ADMINISTRATION" && (
                        <>
                        <option value="PURCHASING">PURCHASING</option>
                        <option value="FINANCE">FINANCE</option>
                        <option value="LOGISTIC">LOGISTIC</option>
                        <option value="ACCOUNTING">ACCOUNTING</option>
                        <option value="TAX">TAX</option>
                        <option value="FREEZER MANAGEMENT">FREEZER MANAGEMENT</option>
                        <option value="PRODUCT COST">PRODUCT COST</option>
                        <option value="DELIVERY VAN REPAIR">DELIVERY VAN REPAIR</option>
                        <option value="INTERNAL AUDIT">INTERNAL AUDIT</option>
                        </>
                    )}

                    {departemen === "PRODUCTION" && (
                        <>
                        <option value="PRODUCTION">PRODUCTION</option>
                        <option value="PPC">PPC</option>
                        <option value="R&D">R&D</option>
                        <option value="QC">QC</option>
                        <option value="QS">QS</option>
                        </>
                    )}

                    {departemen === "SALES & DISTRIBUTION" && (
                        <>
                        <option value="MARKETING OPERATIONAL">MARKETING OPERATIONAL</option>
                        </>
                    )}

                    {departemen === "GENERAL" && (
                        <>
                        <option value="IT SUPPORT">IT SUPPORT</option>
                        <option value="HUMAN RESOURCE & GENERAL AFFAIR">HUMAN RESOURCE & GENERAL AFFAIR</option>
                        <option value="TEKNIK & ADM. MEKANIK">TEKNIK & ADM. MEKANIK</option>
                        </>
                    )}
                    </Form.Select>
                    {divisiError && <span className="text-danger required-select">Divisi belum dipilih</span>}
                    </Form.Group>
                </Col>
                </Row>

                <Row>
                <Col md="12">
                <Form.Group>
                    <label>Tanggal Lahir</label>
                    <Form.Control
                        type="date"
                        value={tanggal_lahir}
                        required
                        onChange={(e) => {
                            setTanggalLahir(e.target.value);
                            setTanggalError(false); 
                        }}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md="12">
                <Form.Group>
                    <label>Tanggal Masuk</label>
                    <Form.Control
                        type="date"
                        value={tanggal_masuk}
                        required
                        onChange={(e) => {
                            const selectedDate = e.target.value;
                            setTanggalMasuk(selectedDate); 

                            if(tanggal_lahir && selectedDate < tanggal_lahir) {
                                setTanggalError(true);
                            } else{
                                setTanggalError(false); 
                            }
                        }}
                        isInvalid={tanggalError}
                    ></Form.Control>
                    {tanggalError && <span className="text-danger required-select">Tanggal masuk tidak boleh lebih awal dari tanggal lahir</span>}
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md="12">
                <Form.Group>
                    <label>Gaji Pokok</label>
                    <Form.Control
                        placeholder="Rp"
                        type="text"
                        required
                        value={formatRupiah(gaji_pokok)}
                        onChange={(e) => handleGajiPokokChange(e.target.value)}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md="12">
                    <div className="modal-footer d-flex flex-column">
                        <Button
                            className="btn-fill w-100 mt-3"
                            type="submit"
                            variant="primary"
                            >
                            Simpan
                        </Button>
                    </div>
                </Col>
                </Row>
                </Form>
            </Modal.Body>
            
            </Modal>
            {/* End Modal */}
        </>
    )
}

export default EditKaryawan;