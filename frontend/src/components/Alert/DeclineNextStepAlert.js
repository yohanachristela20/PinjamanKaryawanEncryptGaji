import { useState } from "react";
import {FaWindowClose, FaRegTimesCircle} from 'react-icons/fa'; 

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

function DeclineNextStepAlert({plafondTersedia}) {
    const [show, setShow] = useState(true);

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

    if (!show) return null;

    return (
       <div className="alert alert-danger font-alert-danger bg-alert" role="alert">
          <Row>
            <Col md="1" className="info-icon-container">
              <FaRegTimesCircle className="info-icon"/>
            </Col>
            <Col md="11">
              <Alert.Heading className="mt-2 mb-0" style={{fontWeight: "500"}}><strong>Pengajuan Tidak Memenuhi Syarat</strong></Alert.Heading>
              {/* <hr className="border" /> */}
              <p className="mt-2">Maaf, anda tidak dapat lanjut ke tahap berikutnya karena pengajuan anda tidak memenuhi syarat.</p>
              {/* {plafondTersedia && (
                <ul>
                  <li>Maksimal jumlah pinjaman : Rp {formatRupiah(plafondTersedia)}</li>
                </ul>
              )} */}
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

export default DeclineNextStepAlert;
