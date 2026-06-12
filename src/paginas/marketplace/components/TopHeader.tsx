import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { usersService } from '../../../api/users';
import { cartService } from '../../../api/cart';
import '../styles/TopHeader.css';

interface TopHeaderProps {
  onSearch?: (query: string) => void;
}

export default function TopHeader({ onSearch }: TopHeaderProps) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    if (!usuario) return;

    // Cargar saldo de billetera
    usersService.getWalletBalance(usuario.id)
      .then((data) => setBalance(data.billetera))
      .catch(() => setBalance(0));

    // Cargar cantidad de items en carrito
    cartService.getMyCart()
      .then((response) => {
        const items = response.data?.orderItems ?? [];
        setCartCount(items.length);
      })
      .catch(() => setCartCount(0));
  }, [usuario]);

  return (
    <header className="marketplace-topheader">
      {/* Búsqueda */}
      <div className="marketplace-topheader-search-container">
        <div className="marketplace-topheader-search-box">
          <span className="material-symbols-outlined marketplace-topheader-search-icon">search</span>
          <input
            className="marketplace-topheader-search-input"
            placeholder="Buscar en el marketplace..."
            type="text"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="marketplace-topheader-actions">
        {/* Wallet con saldo real */}
        <div className="marketplace-topheader-wallet">
          <span className="material-symbols-outlined marketplace-topheader-wallet-icon">
            account_balance_wallet
          </span>
          <span className="marketplace-topheader-wallet-text">
            ${balance.toFixed(2)}
          </span>
        </div>

        {/* Carrito con cantidad real */}
        <button
          className="marketplace-topheader-cart-btn"
          onClick={() => navigate('/carrito')}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {cartCount > 0 && (
            <span className="marketplace-topheader-cart-badge">{cartCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}