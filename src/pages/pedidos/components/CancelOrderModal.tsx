// @ts-nocheck
import React, { useState } from 'react';
import { ordersService } from '../../../services/orders';
import { useNotification } from '../../../contexts/NotificationContext';
import './styles/CancelOrderModal.css';

interface CancelOrderModalProps {
  orderId: number | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function CancelOrderModal({ orderId, onClose, onSuccess }: CancelOrderModalProps) {
  const { mostrarNotificacion } = useNotification();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const confirmCancelOrder = async () => {
    if (orderId === null) return;
    
    try {
      setCancellingId(orderId);
      await ordersService.cancelOrder(orderId);
      mostrarNotificacion('El pedido ha sido cancelado exitosamente.', 'success');
      window.dispatchEvent(new Event('wallet-updated'));
      await onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.data || 'Error al cancelar el pedido';
      mostrarNotificacion(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (orderId === null) return null;

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={e => e.stopPropagation()}>
        <h3>Cancelar Pedido</h3>
        <p>¿Estás seguro de que deseas cancelar este pedido? Se reembolsará tu dinero y no podrás deshacer esta acción.</p>
        <div className="mp-modal-footer">
          <button className="mp-btn-modal-cancelar" onClick={onClose} disabled={cancellingId === orderId}>
            Volver
          </button>
          <button 
            className="mp-btn-modal-confirmar" 
            onClick={confirmCancelOrder} 
            disabled={cancellingId === orderId}
          >
            {cancellingId === orderId ? 'Cancelando...' : 'Sí, Cancelar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
