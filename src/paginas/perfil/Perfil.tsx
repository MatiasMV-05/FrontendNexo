import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../api/users';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';

export default function Perfil() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

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
      alert('Perfil actualizado exitosamente.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
  if (!usuario || !rechargeAmount) return;
  const amount = parseFloat(rechargeAmount);
  if (isNaN(amount) || amount <= 0) { alert('Monto inválido'); return; }
  setLoading(true);
  try {
    await usersService.rechargeWallet(usuario.id, amount); // 204, no devuelve nada
    // Volver a pedir el saldo actualizado
    const saldoActualizado = await usersService.getWalletBalance(usuario.id);
    setBalance(saldoActualizado.billetera);
    setRechargeAmount('');
    alert('Recarga exitosa!');
  } catch (error) {
    console.error('Error recharging wallet:', error);
    alert('Error al recargar la billetera.');
  } finally {
    setLoading(false);
  }
};

  const handleDeleteAccount = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      await usersService.deleteAccount(usuario.id);
      cerrarSesion();
      navigate('/iniciar-sesion');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error al eliminar la cuenta.');
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const iniciales = name
    ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  return (
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
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
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
              <span className="material-symbols-outlined">account_balance_wallet</span>
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
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                Recargar
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Modal eliminar cuenta ── */}
      {showDeleteModal && (
        <div className="perfil-modal-overlay">
          <div className="perfil-modal">
            <h3>¿Estás absolutamente seguro?</h3>
            <p>Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y removerá tus datos.</p>
            <div className="perfil-modal-footer">
              <button className="perfil-btn-cancelar" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="perfil-btn-confirmar-eliminar" onClick={handleDeleteAccount} disabled={loading}>
                {loading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}