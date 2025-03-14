import { useState } from "react";
import {FaExclamationCircle, FaWindowClose} from 'react-icons/fa'; 

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


function PendingAlert({plafondTersedia, hidden}) {
    const [show, setShow] = useState(true);

    if (!show) return null;
    if (hidden) return null;

    return (
       <div className="alert alert-warning font-alert-warning bg-alert" role="alert">
          <Row>
            <Col md="1" className="info-icon-container">
              <FaExclamationCircle className="info-icon"/>
            </Col>
            <Col md="11">
              <Alert.Heading className="mt-2 mb-0" style={{fontWeight: "500"}}><strong>Pengajuan Ditunda</strong></Alert.Heading>
              <p className="mt-2">Maaf, anda tidak dapat mengajukan pinjaman untuk saat ini karena telah mengajukan pinjaman sebelumnya.</p>
              <p>Mohon lakukan <strong>Pelunasan</strong> atau <strong>Pembatalan</strong> di halaman <strong><a href="/karyawan/riwayat-pengajuan" className="link-pengajuan">Riwayat Pengajuan</a></strong> terlebih dahulu.
              </p>
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

export default PendingAlert;
