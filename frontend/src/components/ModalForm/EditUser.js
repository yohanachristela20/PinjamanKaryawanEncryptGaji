import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const EditUser = ({showEditModal, setShowEditModal, user, onSuccess}) => {
    const [id_user, setIdUser] = useState("");
    const [username, setUserName] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState(""); 
    const [roleError, setRoleError] = useState(""); 

    const token = localStorage.getItem("token");
    useEffect(() => {
        if (user) {
            setIdUser(user.id_user);
            setUserName(user.username);
            setRole(user.role);
        }
    }, [user]);

    const updateUser = async(e) => {
        e.preventDefault();
        try {
            await axios.patch(`http://10.70.10.157:5000/user/${user.id_user}`, {
                id_user,
                password,
                role
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // alert("Data berhasil diubah");
            setShowEditModal(false);
            onSuccess();
        } catch (error) {
            // console.log(error.message);
            toast.error('Gagal mengubah data user.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

    return (
        <>
            {/* Mini Modal */}
            <Modal
            className=" modal-primary"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            >
            <Modal.Header className="text-center">
                <h3>Form Edit User</h3>
            </Modal.Header>
            <Modal.Body className="text-left">
                <hr />
                <Form onSubmit={updateUser}>

                <span className="text-danger required-select">(*) Wajib diisi.</span>
                <Row>
                <Col md="12">
                <Form.Group>
                <span className="text-danger">*</span>
                    <label>Username</label>
                    <Form.Control
                        placeholder="Username"
                        type="text"
                        readOnly
                        value={username}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>

                <Row>
                <Col md="12">
                <Form.Group>
                <span className="text-danger">*</span>
                    <label>Role</label>
                    <Form.Select
                        placeholder="Role"
                        className="form-control"
                        value={role}
                        required
                        onChange={(e) => {
                            setRole(e.target.value);
                        }}
                        >
                            <option className="placeholder-form" key='blankChoice' hidden value>Pilih Role</option>
                            <option value="Karyawan">Karyawan</option>
                            <option value="Finance">Finance</option>
                            <option value="Admin">Admin</option>
                            <option value="Super Admin">Super Admin</option>
                    </Form.Select>
                    {roleError && <span className="text-danger required-select">Role belum dipilih</span>}
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

export default EditUser;