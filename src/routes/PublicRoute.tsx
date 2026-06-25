import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

interface Props {
  children: React.ReactNode;
}

// SI EL USUARIO NO ESTA AUTENTICADO: MUESTRA EL COMPONENTE
// SI EL USUARIO YA ESTA AUTENTICADO: REDIRECCIONA A SU DASHBOARD
export default function PublicRoute({ children }: Props) {
  const userJson = localStorage.getItem('user');
  let redirectUrl = '/marketplace';
  if (userJson) {
      try {
          const user = JSON.parse(userJson);
          if (user.rol === 'Administrator') redirectUrl = '/panel-control';
          if (user.rol === 'Seller') redirectUrl = '/mis-ventas';
      } catch (e) {}
  }

  return !isAuthenticated() ? <>{children}</> : <Navigate to={redirectUrl} />;
}
