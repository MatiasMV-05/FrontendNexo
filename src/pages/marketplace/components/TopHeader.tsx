// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { usersService } from '../../../services/users';
import { cartService } from '../../../services/cart';
import '../styles/TopHeader.css';
import { MdAccountBalanceWallet, MdShoppingCart } from 'react-icons/md';

interface TopHeaderProps {
  onSearch?: (query: string) => void;
}

export default function TopHeader({ onSearch: _onSearch }: TopHeaderProps) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);

  const fetchBalance = () => {
    if (!usuario) return;
    usersService.getWalletBalance(usuario.id)
      .then((data) => setBalance(Number(data.billetera) || 0))
      .catch(() => setBalance(0));
  };

  const fetchCartCount = () => {
    cartService.getMyCart()
      .then((response) => {
        const items = response.data?.orderItems ?? [];
        setCartCount(items.length);
      })
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    if (!usuario) return;

    fetchBalance();
    fetchCartCount();

    const handleWalletUpdate = () => {
      fetchBalance();
      fetchCartCount(); // cart might also update
    };

    window.addEventListener('wallet-updated', handleWalletUpdate);
    window.addEventListener('cart-updated', handleWalletUpdate);

    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdate);
      window.removeEventListener('cart-updated', handleWalletUpdate);
    };
  }, [usuario]);

  return (
    <header className="encabezado-superior">
      {/* Búsqueda movida a FiltersPanel */}
      <div></div>

      {/* Acciones */}
      <div className="encabezado-superior-acciones">
        {usuario && (
          <>
            {/* Wallet con saldo real */}
            <div className="encabezado-superior-billetera">
              <MdAccountBalanceWallet className=" encabezado-superior-billetera-icono" />
              <span className="encabezado-superior-billetera-texto">
                ${balance.toFixed(2)}
              </span>
            </div>

            {/* Carrito con cantidad real */}
            <button
              className="encabezado-superior-boton-carrito"
              onClick={() => navigate('/carrito')}
            >
              <MdShoppingCart />
              {cartCount > 0 && (
                <span className="encabezado-superior-insignia-carrito">{cartCount}</span>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
}