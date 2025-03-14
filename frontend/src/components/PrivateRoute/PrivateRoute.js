import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = ({ roles, render, ...rest }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); 

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          roles.includes(userRole) ? (
            render(props)
          ) : (
            <Redirect to="/login" /> 
          )
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;