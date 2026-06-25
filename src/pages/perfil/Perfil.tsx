// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/users';
import { useNotification } from '../../contexts/NotificationContext';
import './Perfil.css';
import { Helmet } from 'react-helmet-async';
import { MdSave, MdAccountBalanceWallet, MdAddCircle } from 'react-icons/md';
import DeleteAccountModal from './components/DeleteAccountModal';

export default function Perfil() {
  const { usuario } = useAuth();
  const { mostrarNotificacion } = useNotification();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setName(usuario.nombre);
      setEmail(usuario.email);
      fetchBalance();
    }
  }, [usuario]);

  const fetchBalance = async () => {
    if (!usuario) return;
    try {
      const data = await usersService.getWalletBalance(usuario.id);
      setBalance(data.billetera);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    setLoading(true);
    try {
      await usersService.updateProfile(usuario.id, { name, email });
      mostrarNotificacion('Perfil actualizado exitosamente.', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      mostrarNotificacion('Error al actualizar el perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!usuario || !rechargeAmount) return;
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) { mostrarNotificacion('Monto inválido', 'error'); return; }
    setLoading(true);
    try {
      await usersService.rechargeWallet(usuario.id, amount);
      const saldoActualizado = await usersService.getWalletBalance(usuario.id);
      setBalance(Number(saldoActualizado.billetera) || 0);
      setRechargeAmount('');
      window.dispatchEvent(new Event('wallet-updated'));
      mostrarNotificacion('¡Recarga exitosa!', 'success');
    } catch (error: any) {
      console.error('Error al recargar la billetera:', error?.response?.data ?? error);
      mostrarNotificacion('Error al recargar la billetera.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const iniciales = name
    ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  return (
    <div>
      <Helmet>
        <title>Perfil - Mi Aplicación</title>
        <meta name="description" content="Visualiza y edita tu información personal, gestiona tu billetera y realiza acciones importantes en tu perfil." />
        <meta name="keywords" content="Perfil, Información Personal, Billetera, Recarga, Gestión de Cuenta" />
        <meta name="author" content="Nexo" />
        <meta property="og:title" content="Perfil - Mi Aplicación" />
        <meta property="og:description" content="Visualiza y edita tu información personal, gestiona tu billetera y realiza acciones importantes en tu perfil." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="perfil-wrapper">
        {/* ── Header ── */}
        <header className="perfil-header">
          <div className="perfil-avatar-wrapper">
            <div className="perfil-avatar">{iniciales}</div>
            <span className="perfil-avatar-rol">{usuario?.rol || 'Customer'}</span>
          </div>
          <div className="perfil-header-info">
            <h1>{name}</h1>
            <p>{email}</p>
          </div>
        </header>

        {/* ── Grid ── */}
        <div className="perfil-grid">

          {/* Columna izquierda */}
          <div className="perfil-columna-izquierda">

            {/* Información personal */}
            <section className="perfil-seccion">
              <h2>Información Personal</h2>
              <form className="perfil-form" onSubmit={handleSaveProfile}>
                <div className="perfil-campo">
                  <label htmlFor="perfil-nombre">Nombre Completo</label>
                  <input
                    className="perfil-input"
                    id="perfil-nombre"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="perfil-campo">
                  <label htmlFor="perfil-email">Correo Electrónico</label>
                  <input
                    className="perfil-input"
                    id="perfil-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="perfil-form-footer">
                  <button type="submit" className="perfil-btn-guardar" disabled={loading}>
                    <MdSave style={{ fontSize: '18px' }} />
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </section>

            {/* Zona de peligro */}
            <section className="perfil-danger-zone">
              <div>
                <h3>Eliminar cuenta</h3>
                <p>Una vez eliminada, no hay vuelta atrás. Por favor, asegúrate de estar seguro.</p>
              </div>
              <button className="perfil-btn-eliminar" onClick={() => setShowDeleteModal(true)}>
                Eliminar cuenta
              </button>
            </section>
          </div>

          {/* Columna derecha: Wallet */}
          <section className="perfil-wallet">
            <div className="perfil-wallet-header">
              <h2>
                <MdAccountBalanceWallet />
                Mi Wallet
              </h2>
            </div>

            <div className="perfil-wallet-saldo">
              <h3>Saldo Disponible</h3>
              <h2 className="perfil-wallet-monto">${balance.toFixed(2)}</h2>
            </div>

            <div className="perfil-recarga">
              <label htmlFor="perfil-recarga-monto">Monto a recargar</label>
              <div className="perfil-recarga-fila">
                <input
                  className="perfil-input"
                  id="perfil-recarga-monto"
                  type="number"
                  placeholder="0.00"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                />
                <button className="perfil-btn-recargar" onClick={handleRecharge} disabled={loading}>
                  <MdAddCircle style={{ fontSize: '18px' }} />
                  Recargar
                </button>
              </div>
            </div>
          </section>
        </div>

        <DeleteAccountModal
          isOpen={showDeleteModal}
          userId={usuario?.id}
          onClose={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  );
}