import React, { Component, useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Button, Modal } from "react-bootstrap";
import {FaDoorClosed, FaDoorOpen, FaKey, FaUser} from 'react-icons/fa'; 
import routes from "routes.js";
import UbahPassword from "components/ModalForm/UbahPassword.js";
import "../../assets/scss/lbd/_logout.scss";
import axios from "axios";
import { stopInactivityTimer } from "views/Heartbeat";

function Header() {
  const location = useLocation();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false); 
  const [showUbahPassword, setShowUbahPassword] = useState(false);
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {

      const username = localStorage.getItem("username");
      if (!token || !username) return;

      try {
        const response = await axios.get(`http://10.70.10.157:5000/user-details/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setUserData({
            id_karyawan: response.data.id_karyawan,
            nama: response.data.nama,
            divisi: response.data.divisi,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
  


  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Beranda";
  };

  const handleLogout = () => {
    stopInactivityTimer();
    axios.post("http://10.70.10.157:5000/logout", {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      history.push("/login");
      window.location.reload();
    });
  };

  return (
    <>
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
          <Button
            variant="dark"
            className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
          <Navbar.Brand
            href="#home"
            onClick={(e) => e.preventDefault()}
            className="mr-2"
          >
            {getBrandText()}
          </Navbar.Brand>
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="nav mr-auto" navbar>
            <Nav.Item>
              <Nav.Link
                data-toggle="dropdown"
                href="#pablo"
                onClick={(e) => e.preventDefault()}
                className="m-0"
              >
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Nav className="ml-auto" navbar>
          
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                aria-expanded={false}
                as={Nav.Link}
                id="navbarDropdownMenuLink"
                variant="default"
                className="mr-5 mt-2"
              >
                <span><FaUser style={{ marginRight: '8px' }} /> {userData.nama || "Loading..."}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink">
                <Dropdown.Item
                  onClick={(e) => e.preventDefault()}
                >
                  {userData.id_karyawan
                      ? `${userData.id_karyawan} - ${userData.nama}`
                      : "Loading..."}
                  <p className="font-position">{userData.divisi || "Loading..."}</p>
                </Dropdown.Item>
                <div className="divider"></div>
                <Dropdown.Item
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    
                    setShowUbahPassword(true); 
                  }}
                ><FaKey style={{ marginRight: '8px' }} />
                  Ubah Password
                </Dropdown.Item>
                <div className="divider"></div>
                
                <Dropdown.Item
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true); 
                  }}
                ><FaDoorOpen style={{ marginRight: '8px' }} />
                  Keluar
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-warning">
      <Modal.Header>
        <Modal.Title>Logout</Modal.Title>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={() => setShowModal(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            &times; {/* Simbol 'x' */}
          </button>
      </Modal.Header>
      <Modal.Body >Apakah anda yakin ingin keluar?</Modal.Body>
      <Modal.Footer className="mb-4">
        <Button variant="danger" onClick={() => setShowModal(false)}>
          Tidak
        </Button>
        <Button variant="success" onClick={handleLogout}>
          Ya
        </Button> 
      </Modal.Footer>
    </Modal>
    <UbahPassword
        show={showUbahPassword}
        onHide={() => setShowUbahPassword(false)}
        onClick={handleLogout}
        onSubmit={(newPassword) => updatePassword(userData.id_karyawan, newPassword)}
    />
    </>
  );
}

export default Header;
