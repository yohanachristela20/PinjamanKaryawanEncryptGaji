import { useState, useEffect } from "react";
import { FaRegCheckCircle, FaWindowClose } from 'react-icons/fa'; 

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

function AcceptedAlert({ selectedPinjaman, hidden }) {
    const [show, setShow] = useState(true);

    if (!show) return null;
    if (hidden) return null;

    return (
        <div className="alert alert-success font-alert-success bg-alert" role="alert">
            <Row>
                <Col md="1" className="info-icon-container">
                    <FaRegCheckCircle className="info-icon"/>
                </Col>
                <Col md="11">
                    <Alert.Heading className="mt-2 mb-0" style={{fontWeight: "500"}}><strong>Pengajuan Memenuhi Syarat</strong></Alert.Heading>
                    {/* <hr className="border" /> */}
                    <p className="mt-2">Selamat! Pengajuan anda telah memenuhi syarat.</p>
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

export default AcceptedAlert;