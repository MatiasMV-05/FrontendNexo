import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from '../components/RutaProtegida';
import MainLayout from '../layouts/MainLayout';

import IniciarSesion from '../paginas/autenticacion/IniciarSesion';
import Registro from '../paginas/autenticacion/Registro';

import Marketplace from '../paginas/marketplace/Marketplace';
import Carrito from '../paginas/carrito/Carrito';
import Perfil from '../paginas/perfil/Perfil';
import MisPedidos from '../paginas/pedidos/MisPedidos';

import MisVentas from '../paginas/seller/MisVentas';
import MisProductos from '../paginas/seller/MisProductos';

import AdminDashboard from '../paginas/administrador/AdminDashboard';
import GestionUsuarios from '../paginas/administrador/GestionUsuarios';
import GestionProductos from '../paginas/administrador/GestionProductos';

import NotFound from '../paginas/NotFound/NotFound';

const TODOS = ['Customer', 'Seller', 'Administrator'] as const;

const RutasApp = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── PÚBLICAS ──────────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/iniciar-sesion" replace />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro" element={<Registro />} />

        {/* ── AUTENTICADAS (con Sidebar vía MainLayout) ─────────────── */}
        <Route element={<MainLayout />}>

          {/* Solo Administrator */}
          <Route path="/panel-control"     element={<RutaProtegida rolesPermitidos={['Administrator']}><AdminDashboard /></RutaProtegida>} />
          <Route path="/gestion-usuarios"  element={<RutaProtegida rolesPermitidos={['Administrator']}><GestionUsuarios /></RutaProtegida>} />
          <Route path="/gestion-productos" element={<RutaProtegida rolesPermitidos={['Administrator']}><GestionProductos /></RutaProtegida>} />

          {/* Todos los roles autenticados */}
          <Route path="/marketplace" element={<RutaProtegida rolesPermitidos={[...TODOS]}><Marketplace /></RutaProtegida>} />
          <Route path="/mis-pedidos" element={<RutaProtegida rolesPermitidos={[...TODOS]}><MisPedidos /></RutaProtegida>} />
          <Route path="/carrito"     element={<RutaProtegida rolesPermitidos={[...TODOS]}><Carrito /></RutaProtegida>} />
          <Route path="/perfil"      element={<RutaProtegida rolesPermitidos={[...TODOS]}><Perfil /></RutaProtegida>} />

          {/* Solo Seller */}
          <Route path="/mis-ventas"    element={<RutaProtegida rolesPermitidos={['Seller']}><MisVentas /></RutaProtegida>} />
          <Route path="/mis-productos" element={<RutaProtegida rolesPermitidos={['Seller']}><MisProductos /></RutaProtegida>} />

          {/* Acceso denegado dentro del layout */}
          <Route path="/no-autorizado" element={<NotFound />} />

        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
};

export default RutasApp;