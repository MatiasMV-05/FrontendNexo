import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

interface Props {
  children: React.ReactNode;
}

// SI EL USUARIO ESTA AUTENTICADO: MUESTRA EL COMPONENTE HIJO
// SI NO ESTA AUTENTICADO: REDIRECCIONA AL LOGIN
export default function PrivateRoute({ children }: Props) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/iniciar-sesion" />; 
}
