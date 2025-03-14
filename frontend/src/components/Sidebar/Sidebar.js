import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

function Sidebar({ color, image, routes }) {
  // Get the user role from localStorage
  const role = localStorage.getItem("role"); // Assuming the role is stored in localStorage

  // Filter routes to exclude "/screening-karyawan" and "/login" first
  const filteredRoutes = routes.filter(
    (route) => !["/screening-karyawan", "/login"].includes(route.path)
  );

  const roleFilteredRoutes = filteredRoutes.filter((route) => {
    if (role === "Admin") return route.layout === "/admin";
    if (role === "Finance") return route.layout === "/finance";
    if (role === "Karyawan") return route.layout === "/karyawan";
    if (role === "Super Admin") return route.layout === "/super-admin";
    return false; // If role doesn't match, exclude all routes
  });

  const location = useLocation();

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div className="sidebar-wrapper sidebar-color">
        <div className="logo d-flex align-items-center justify-content-start">
          <a
            className="simple-text logo-mini mx-3"
          >
            <div className="logo-img">
              <img src={require("assets/img/company_logo4.png")} alt="..." />
            </div>
          </a>
          <a className="simple-text">Pijar Campina</a>
        </div>
        <Nav>
          {roleFilteredRoutes.map((prop, key) => {
            if (!prop.redirect)
              return (
                <li
                  className={
                    prop.upgrade
                      ? "active active-pro"
                      : activeRoute(prop.layout + prop.path)
                  }
                  key={key}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className="nav-link"
                    activeClassName="active"
                  >
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            return null;
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
