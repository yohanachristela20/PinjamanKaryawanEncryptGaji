import React, { useEffect, useState } from "react";
import { FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddKaryawan from "components/ModalForm/AddKaryawan.js";
import EditKaryawan from "components/ModalForm/EditKaryawan.js";
import ImportKaryawan from "components/ModalForm/ImportKaryawan.js";
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";


// react-bootstrap components
import {Button, Container, Row, Col, Card, Table, Spinner } from "react-bootstrap";

function MasterKaryawan() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [karyawan, setKaryawan] = useState([]); 
  const [selectedKaryawan, setSelectedKaryawan] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const filteredKaryawan = karyawan.filter((karyawan) =>
    (karyawan.id_karyawan && String(karyawan.id_karyawan).toLowerCase().includes(searchQuery)) ||
    (karyawan.nama && String(karyawan.nama).toLowerCase().includes(searchQuery)) ||
    (karyawan.jenis_kelamin && String(karyawan.jenis_kelamin).toLowerCase().includes(searchQuery)) ||
    (karyawan.departemen && String(karyawan.departemen).toLowerCase().includes(searchQuery)) ||
    (karyawan.divisi && String(karyawan.divisi).toLowerCase().includes(searchQuery)) ||
    (karyawan.tanggal_lahir && String(karyawan.tanggal_lahir).toLowerCase().includes(searchQuery)) ||
    (karyawan.tanggal_masuk && String(karyawan.tanggal_masuk).toLowerCase().includes(searchQuery)) ||
    (karyawan.gaji_pokok && String(karyawan.gaji_pokok).toLowerCase().includes(searchQuery)) 
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKaryawan.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");

  const getKaryawan = async () =>{
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // console.log("User token: ", token, "User role:", role);
    try {

      setLoading(true);
      
      const response = await axios.get("http://10.70.10.157:5000/karyawan", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setKaryawan(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  const deleteKaryawan = async(id_karyawan) =>{
    try {
      await axios.delete(`http://10.70.10.157:5000/karyawan/${id_karyawan}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("Data karyawan berhasil dihapus.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
      getKaryawan(); 
     
    } catch (error) {
      console.log(error.message); 
    }
  }

  useEffect(()=> {
    try {
      if (!token) {
        console.error("Token tidak tersedia");
        return;
      }

      getKaryawan();
    } catch (error) {
      console.error("Error fetching data", error.message); 
    }
  }, [token]); 


  
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


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getKaryawan();
    toast.success("Data karyawan baru berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getKaryawan();
    toast.success("Data karyawan berhasil diperbarui!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }

  const handleImportSuccess = () => {
    getKaryawan();
    toast.success("Data Karyawan berhasil diimport!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const downloadCSV = (data) => {
    const header = ["id_karyawan", "nama", "jenis_kelamin", "departemen", "divisi", "tanggal_lahir", "tanggal_masuk", "gaji_pokok"];
    const rows = data.map((item) => [
      item.id_karyawan,
      item.nama,
      item.jenis_kelamin,
      item.departemen,
      item.divisi,
      item.tanggal_lahir,
      item.tanggal_masuk,
      item.gaji_pokok,
    ]);
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "master_karyawan.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Master Karyawan", 12, 20);

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
  
    const headers = [["ID Karyawan", "Nama", "Jenis Kelamin", "Departemen", "Divisi", "Tanggal Lahir", "Tanggal Masuk", "Gaji Pokok"]];
  
    const rows = data.map((item) => [
      item.id_karyawan,
      item.nama,
      item.jenis_kelamin,
      item.departemen,
      item.divisi,
      item.tanggal_lahir,
      item.tanggal_masuk,
      formatRupiah(item.gaji_pokok),
    ]);

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: rows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });

    doc.save("master_karyawan.pdf");
  };
  
  useEffect(() => {
    getKaryawan();
  }, []); 

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
              Tambah Data
            </Button>

            <AddKaryawan showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

            <EditKaryawan
                        showEditModal={showEditModal}
                        setShowEditModal={setShowEditModal}
                        karyawan={selectedKaryawan}
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

          <ImportKaryawan showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadCSV(karyawan)}>
            <FaFileCsv style={{ marginRight: '8px' }} />
            Unduh CSV
          </Button>

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadPDF(karyawan)}>
            <FaFilePdf style={{ marginRight: '8px' }} />
            Unduh PDF
          </Button>


          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          
          <Col md="12">
            <Card className="striped-tabled-with-hover mt-4">
              <Card.Header>
                <Card.Title as="h4">Master Karyawan</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                  <Table className="table-striped table-hover">
                  <div className="table-scroll" style={{ height: 'auto' }}>
                     <table className="flex-table table table-striped table-hover">
                     <thead >
                     <tr>
                       <th>ID Karyawan</th>
                       <th className="border-0 text-wrap">Nama Lengkap</th>
                       <th className="border-0 text-wrap">Jenis Kelamin</th>
                       <th className="border-0 text-wrap">Departemen</th>
                       <th className="border-0 text-wrap">Divisi</th>
                       <th className="border-0 text-wrap">Tanggal Lahir</th>
                       <th className="border-0 text-wrap">Tanggal Masuk</th>
                       <th className="border-0 text-wrap">Gaji Pokok</th>
                       <th className="border-0 text-wrap">Aksi</th>
                     </tr>
                   </thead>
                   <tbody className="scroll scroller-tbody">
                     {currentItems.map((karyawan, index) => (
                       <tr key={karyawan.id_karyawan}>
                       <td className="text-center">{karyawan.id_karyawan}</td>
                       <td className="text-center">{karyawan.nama}</td>
                       <td className="text-center">{karyawan.jenis_kelamin}</td>
                       <td className="text-center">{karyawan.departemen}</td>
                       <td className="text-center">{karyawan.divisi}</td>
                       <td className="text-center">{karyawan.tanggal_lahir}</td>
                       <td className="text-center">{karyawan.tanggal_masuk}</td>
                       <td className="text-right">{formatRupiah(karyawan.gaji_pokok)}</td>
                       <td className="text-center">
                       <Button
                         className="btn-fill pull-right warning mb-2"
                         type="button"
                         variant="warning"
                         onClick={() => {
                           setShowEditModal(true);
                           setSelectedKaryawan(karyawan);
                           // console.log("Berhasil");
                         }}
                         style={{
                           width: 103,
                           fontSize: 14,
                         }}>
                         <FaRegEdit style={{ marginRight: '8px' }} />
                         Ubah
                       </Button>
                       <Button
                         className="btn-fill pull-right"
                         type="button"
                         variant="danger"
                         onClick={() => deleteKaryawan(karyawan.id_karyawan)}
                         style={{
                           width: 103,
                           fontSize: 14,
                         }}>
                         <FaTrashAlt style={{ marginRight: '8px' }} />
                         Hapus
                       </Button>
                       
                       </td>
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
                  totalItemsCount={filteredKaryawan.length}
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

export default MasterKaryawan;
