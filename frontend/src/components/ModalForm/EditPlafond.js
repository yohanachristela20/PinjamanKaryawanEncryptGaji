import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';


const EditPlafond = ({showEditModal, setShowEditModal, plafond, onSuccess}) => {
    const [id_plafond, setIdPlafond] = useState("");
    const [tanggal_penetapan, setTanggalPenetapan] = useState("");
    const [jumlah_plafond, setJumlahPlafond] = useState("");
    const [keterangan, setKeterangan] = useState("");

    const [tanggalError, setTanggalError] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (plafond) {
            setIdPlafond(plafond.id_plafond);
            setTanggalPenetapan(plafond.tanggal_penetapan);
            setJumlahPlafond(plafond.jumlah_plafond);
            setKeterangan(plafond.keterangan);
        }
    }, [plafond]);

    

    const updatePlafond = async(e) => {
        e.preventDefault();

        try {
            await axios.patch(`http://10.70.10.157:5000/plafond/${plafond.id_plafond}`, {
                id_plafond,
                tanggal_penetapan,
                jumlah_plafond,
                keterangan
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
        } catch (error) {
            // console.log(error.message);
            toast.error('Gagal mengubah data plafond.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

    const formatRupiah = (angka) => {
        let PlafondString = angka.toString().replace(".00");
        let sisa = PlafondString.length % 3;
        let rupiah = PlafondString.substr(0, sisa);
        let ribuan = PlafondString.substr(sisa).match(/\d{3}/g);
    
        if (ribuan) {
            let separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }
        
        return rupiah;
    };
    
    const handleJumlahPlafondChange = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setJumlahPlafond(numericValue);
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
                <h3>Form Ubah Plafond</h3>
                
            </Modal.Header>
            <Modal.Body className="text-left">
                <hr />
                <Form onSubmit={updatePlafond}>
                <Row>
                <Col md="12">
                    <Form.Group>
                        <label>ID Plafond</label>
                        <Form.Control
                            disabled
                            type="text"
                            required
                            value={id_plafond}
                        ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>

                <Row>
                <Col md="12">
                <Form.Group>
                    <label>Tanggal Penetapan</label>
                    <Form.Control
                        type="date"
                        value={tanggal_penetapan}
                        required
                        onChange={(e) => {
                            setTanggalPenetapan(e.target.value);
                            setTanggalError(false); 
                        }}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md="12">
                <Form.Group>
                    <label>Jumlah Plafond</label>
                    <Form.Control
                        placeholder="Rp"
                        type="text"
                        required
                        value={formatRupiah(jumlah_plafond)}
                        onChange={(e) => handleJumlahPlafondChange(e.target.value)}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>

                <Row>
                <Col md="12">
                <Form.Group>
                    <label>Keterangan</label>
                    <Form.Control
                        type="text"
                        value={keterangan}
                        required
                        onChange={(e) => setKeterangan(e.target.value)}
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
                            Ubah
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

export default EditPlafond;