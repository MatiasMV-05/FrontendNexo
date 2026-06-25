import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RutaProtegida from '../components/RutaProtegida';
import { NotificationProvider } from '../contexts/NotificationContext';

import IniciarSesion from '../pages/autenticacion/IniciarSesion';
import Registro from '../pages/autenticacion/Registro';

import Marketplace from '../pages/marketplace/Marketplace';
import Carrito from '../pages/carrito/Carrito';
import Perfil from '../pages/perfil/Perfil';
import MisPedidos from '../pages/pedidos/MisPedidos';

import MisVentas from '../pages/seller/MisVentas';
import MisProductos from '../pages/seller/MisProductos';

import AdminDashboard from '../pages/administrador/AdminDashboard';
import GestionUsuarios from '../pages/administrador/GestionUsuarios';
import GestionProductos from '../pages/administrador/GestionProductos';

import NotFound from '../pages/NotFound/NotFound';
import NoAutorizado from '../pages/NoAutorizado/NoAutorizado';

import Home from '../pages/landing/Home';
import About from '../pages/landing/About';

import PublicLayout from '../layouts/PublicLayout';
import PrivateLayout from '../layouts/PrivateLayout';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

const TODOS = ['Customer', 'Seller', 'Administrator'] as const;
const COMPRADORES = ['Customer', 'Seller'] as const;

export default function RutasApp() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>

          {/* ── PÚBLICAS CON NAVBAR ────────────────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/acerca-de-nosotros" element={<About />} />
            <Route path="/catalogo" element={<Marketplace />} />
          </Route>

          {/* ── AUTENTICACIÓN SIN NAVBAR ──────────────────────────────────────── */}
          <Route path="/iniciar-sesion" element={
            <PublicRoute>
              <IniciarSesion />
            </PublicRoute>
          } />
          <Route path="/registro" element={
            <PublicRoute>
              <Registro />
            </PublicRoute>
          } />

          {/* ── PRIVADAS ──────────────────────────────────────────────── */}
          <Route element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          }>
            {/* Solo Administrator */}
            <Route path="/panel-control"     element={<RutaProtegida rolesPermitidos={['Administrator']}><AdminDashboard /></RutaProtegida>} />
            <Route path="/gestion-usuarios"  element={<RutaProtegida rolesPermitidos={['Administrator']}><GestionUsuarios /></RutaProtegida>} />
            <Route path="/gestion-productos" element={<RutaProtegida rolesPermitidos={['Administrator']}><GestionProductos /></RutaProtegida>} />

            {/* Todos los roles autenticados */}
            <Route path="/app/acerca-de-nosotros" element={<RutaProtegida rolesPermitidos={[...TODOS]}><About /></RutaProtegida>} />
            <Route path="/perfil"      element={<RutaProtegida rolesPermitidos={[...TODOS]}><Perfil /></RutaProtegida>} />

            {/* Solo Clientes o Vendedores */}
            <Route path="/marketplace" element={<RutaProtegida rolesPermitidos={[...COMPRADORES]}><Marketplace /></RutaProtegida>} />
            <Route path="/mis-pedidos" element={<RutaProtegida rolesPermitidos={[...COMPRADORES]}><MisPedidos /></RutaProtegida>} />
            <Route path="/carrito"     element={<RutaProtegida rolesPermitidos={[...COMPRADORES]}><Carrito /></RutaProtegida>} />

            {/* Solo Seller */}
            <Route path="/mis-ventas"    element={<RutaProtegida rolesPermitidos={['Seller']}><MisVentas /></RutaProtegida>} />
            <Route path="/mis-productos" element={<RutaProtegida rolesPermitidos={['Seller']}><MisProductos /></RutaProtegida>} />
          </Route>

          {/* ── PÁGINAS DE ERROR (sin Sidebar) ───────────────────────────── */}
          <Route path="/no-autorizado" element={<NoAutorizado />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}