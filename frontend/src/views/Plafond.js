import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddPlafond from "components/ModalForm/AddPlafond.js";
import EditPlafond from "components/ModalForm/EditPlafond.js";
import ImportPlafond from "components/ModalForm/ImportPlafond.js"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";

import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Table, 
  Spinner  
} from "react-bootstrap";

function Plafond() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [plafond, setPlafond] = useState([]); 
  const [selectedPlafond, setSelectedPlafond] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const filteredPlafond = plafond.filter((plafond) =>
    (plafond.id_plafond && String(plafond.id_plafond).toLowerCase().includes(searchQuery)) ||
    (plafond.tanggal_penetapan && String(plafond.tanggal_penetapan).toLowerCase().includes(searchQuery)) ||
    (plafond.keterangan && (plafond.keterangan).toLowerCase().includes(searchQuery))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlafond.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");

  useEffect(()=> {
    getPlafond();
  }, []); 

  const getPlafond = async () =>{
    try {
      setLoading(true);
      const response = await axios.get("http://10.70.10.157:5000/plafond", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setPlafond(response.data);
      // console.log("Plafond:", response.data)
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getPlafond();
    toast.success("Data plafond berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
};

const handleEditSuccess = () => {
  getPlafond();
  toast.success("Data plafond berhasil diperbarui!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
  });
};

const handleImportButtonClick = () => {
  setShowImportModal(true);
}

const handleImportSuccess = () => {
  getPlafond();
  // toast.success("Plafond berhasil diimport!", {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: true,
  // });
};



const downloadCSV = (data) => {
  const header = ["id_plafond", "tanggal_penetapan", "jumlah_plafond", "keterangan", "createdAt", "updatedAt"];
  const rows = data.map((item) => [
    item.id_plafond,
    item.tanggal_penetapan,
    item.jumlah_plafond,
    item.keterangan,
    item.createdAt,
    item.updatedAt
  ]);

  const csvContent = [header, ...rows]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "master_plafond.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadPDF = (data) => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(12); 
  doc.text("Master Plafond", 12, 20);

  const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
  
    doc.setFontSize(12); 
    doc.text(`Tanggal cetak: ${formattedDate}`, 12, 30);

  const headers = [["ID Plafond", "Tanggal Penetapan", "Jumlah Plafond", "Keterangan", "Created At", "Updated At"]];

  const rows = data.map((item) => [
    item.id_plafond,
    item.tanggal_penetapan,
    formatRupiah(item.jumlah_plafond),
    item.keterangan,
    item.createdAt,
    item.updatedAt,
  ]);

  const marginTop = 15; 

  doc.autoTable({
    startY: 20 + marginTop, // Posisi Y awal
    head: headers,
    body: rows,
    styles: { fontSize: 12 }, // Ukuran font tabel
    headStyles: { fillColor: [3, 177, 252] }, // Warna header tabel
  });

  doc.save("master_plafond.pdf");
};

  return (
    <>
      <Container fluid>
      <Row>
          <div>
            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="success"
              onClick={() => setShowAddModal(true)}>
              <FaPlusCircle style={{ marginRight: '8px' }} />
              Topup Plafond
            </Button>

            <AddPlafond showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

            <EditPlafond
                        showEditModal={showEditModal}
                        setShowEditModal={setShowEditModal}
                        plafond={selectedPlafond}
                        onSuccess={handleEditSuccess}
                      />
          </div>

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="info"
            onClick={handleImportButtonClick}>
            <FaFileImport style={{ marginRight: '8px' }} />
            Import Data
          </Button>
           {/* {showImport && <ImportPlafond />} */}

           <ImportPlafond showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadCSV(plafond)}>
            <FaFileCsv style={{ marginRight: '8px' }} />
            Unduh CSV
          </Button>

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadPDF(plafond)}>
            <FaFilePdf style={{ marginRight: '8px' }} />
            Unduh PDF
          </Button>

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>
          
          <Col md="12">
            <Card className="striped-tabled-with-hover mt-4">
              <Card.Header>
                <Card.Title as="h4">Plafond</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p>Loading...</p>
                </div>
              ) : (
                <Table className="table-hover table-striped">
                    <div className="table-scroll" style={{ height:'auto' }}>
                      <table className="flex-table table table-striped table-hover">
                        <thead>
                      <tr>
                        <th>ID Plafond</th>
                        <th className="border-0">Tanggal Penetapan</th>
                        <th className="border-0">Jumlah Plafond</th>
                        <th className="border-0">Keterangan</th>
                        <th className="border-0">Terakhir Dibuat</th>
                        <th className="border-0">Terakhir Update</th>
                        {/* <th className="border-0">Aksi</th> */}
                      </tr>
                        </thead>
                        <tbody className="scroll scroller-tbody">
                          {currentItems.map((plafond) => (
                            <tr key={plafond.id_plafond}>
                              <td className="text-center">{plafond.id_plafond}</td>
                              <td className="text-center">{plafond.tanggal_penetapan}</td>
                              <td className="text-right">{formatRupiah(plafond.jumlah_plafond)}</td>
                              <td className="text-center">{plafond.keterangan}</td>
                              <td className="text-center">{new Date(plafond.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                              <td className="text-center">{new Date(plafond.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                              {/* <td className="text-center">
                                <Button className="btn-fill pull-right warning" variant="warning" onClick={() => { setShowEditModal(true); setSelectedPlafond(plafond); }} style={{ width: 96, fontSize: 14 }}>
                                  <FaRegEdit style={{ marginRight: '8px' }} />
                                  Ubah
                                </Button>
                              </td> */}
                              {/* <td className="text-center">
                                <Button className="btn-fill pull-right danger" variant="danger"  onClick={() => deletePlafond(plafond.id_plafond)} style={{ width: 96, fontSize: 14 }}>
                                  <FaTrashAlt style={{ marginRight: '8px' }} />
                                  Batal
                                </Button>
                              </td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </Table>
              )}
            </Card.Body>
            </Card>
            <div className="pagination-container">
            <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={filteredPlafond.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  itemClass="page-item"
                  linkClass="page-link"
            />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Plafond;
