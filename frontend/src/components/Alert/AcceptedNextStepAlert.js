import { useState, useEffect } from "react";
import { FaInfoCircle, FaWindowClose } from 'react-icons/fa'; 
import DeclineAlert from "components/Alert/DeclineAlert.js";

import {
    Badge,
    Button,
    Card,
    Navbar,
    Nav,
    Table,
    Container,
    Row,
    Col,
    Form,
    OverlayTrigger,
    Tooltip,
    Alert, 
    Spinner
  } from "react-bootstrap";

function AcceptedNextStepAlert({ selectedPinjaman, hidden }) {
    const [show, setShow] = useState(true);

    if (!show) return null;
    if (hidden) return null;

    return (
        <div className="alert alert-info bg-alert" role="alert">
            <Row>
                <Col md="1" className="info-icon-container">
                    <FaInfoCircle className="info-icon"/>
                </Col>
                <Col md="11">
                    <Alert.Heading className="mt-2 mb-0" style={{fontWeight: "500"}}><strong>Pengajuan Diterima Dengan Antrean</strong></Alert.Heading>
                    {/* <hr className="border" /> */}
                    <p className="mt-2 mb-0">Hasil screening data diri anda telah memenuhi syarat.</p>
                    <p className="mt-0">Namun karena terbatasnya jumlah plafond, pengajuan pinjaman anda harus masuk ke antrean terlebih dahulu.</p>
                    <p className="mt-0"><strong>Klik tombol Simpan untuk mengajukan pinjaman.</strong></p>
                    <Button
                        variant="link"
                        onClick={() => setShow(false)}
                        className="close-button"
                    >
                        <FaWindowClose style={{ marginRight: "-8px", marginTop:"-15px" }} />
                    </Button>
                </Col>
            </Row>
        </div>
        
    );
}

export default AcceptedNextStepAlert;