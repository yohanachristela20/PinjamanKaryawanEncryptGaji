import React, { useState } from "react";
import { Badge, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { FaFileImport } from "react-icons/fa";
import { toast } from 'react-toastify';

const ImportUser = ({showImportModal, setShowImportModal, onSuccess}) => {
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileImport = () => {
    if (file.type !== "text/csv") {
      alert("File harus berformat CSV.");
      return;
    }
  
    const formData = new FormData();
    formData.append("csvfile", file);

    fetch("http://localhost:5000/user/import-csv", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
    },
    })
    .then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        return response.json();
    })
    .then((data) => {
        if (data.success) {
            setShowImportModal(false); 
            onSuccess(); 
        } else {
            alert(data.message || "Gagal mengimpor data.");
        }
    })
    .catch((error) => {
        console.error("Error:", error);
        alert(`Terjadi kesalahan: ${error.message}`);
    });

  };

  return (
    <Modal 
      className="modal-primary"
      show={showImportModal}
      onHide={() => setShowImportModal(false)}>
    <Modal.Header className="text-center">
      <h3>Import User</h3>
    </Modal.Header>
    <Modal.Body className="text-left">
      <hr />
      <div>
      <span className="text-danger required-select">*Pastikan table headers sama dengan column name dalam database.</span>
      <p>Pilih file CSV yang akan diimport. </p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <Button
          className="btn-fill pull-right mt-4 mb-4"
          type="button"
          variant="info"
          onClick={handleFileImport}
          disabled={!file}
        >
          <FaFileImport style={{ marginRight: "8px" }} />
          Import Data
        </Button>
      </div>
    </Modal.Body>
    </Modal>
    
  );
};

export default ImportUser;


