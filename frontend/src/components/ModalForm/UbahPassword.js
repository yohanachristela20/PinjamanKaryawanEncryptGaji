import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { stopInactivityTimer } from "views/Heartbeat";

function UbahPassword({ show, onHide }) {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const history = useHistory();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const storedRole = localStorage.getItem("role");

        if (storedUsername) setUsername(storedUsername);
        if (storedRole) setRole(storedRole);
    }, [show]);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword) {
            alert("Semua field harus diisi!");
            return;
        }

        try {
            const response = await axios.post("http://10.70.10.157:5000/change-password", {
                username,
                role,
                oldPassword,
                newPassword,
            });

            alert(response.data.message); 
            

            axios.post("http://10.70.10.157:5000/logout", {}, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }).finally(() => {
                  stopInactivityTimer();
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  history.push("/login");
                  window.location.reload();
                });
        } catch (error) {
            console.error("Error saat mengganti password:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header>
                <Modal.Title>Form Ubah Password</Modal.Title>
                <Button
                    variant="close"
                    aria-label="Close"
                    onClick={onHide}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    &times;
                </Button>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleChangePassword}>
                <span className="text-danger required-select">(*) Wajib diisi.</span>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            readOnly
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                            value={role}
                            type="text"
                            placeholder="Role"
                            onChange={(e) => setRole(e.target.value)}
                            required
                            readOnly
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <span className="text-danger">*</span>
                        <Form.Label>Password Lama</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Masukkan Password Lama"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <span className="text-danger">*</span>
                        <Form.Label>Password Baru</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Masukkan Password Baru"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col>
                            <Button
                                type="submit"
                                className="btn-fill w-100 mb-4 mt-2"
                                variant="primary"
                            >
                                Ubah Password
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default UbahPassword;
