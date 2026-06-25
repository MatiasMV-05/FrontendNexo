import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import './styles/Notification.css';
import { MdClose, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationMessage {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  mostrarNotificacion: (mensaje: string, tipo?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState<NotificationMessage[]>([]);

  const mostrarNotificacion = useCallback((mensaje: string, tipo: NotificationType = 'info') => {
    const id = Date.now();
    setNotificaciones((prev) => [...prev, { id, message: mensaje, type: tipo }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotificaciones((prev) => prev.filter((notif) => notif.id !== id));
    }, 4000);
  }, []);

  const eliminarNotificacion = (id: number) => {
    setNotificaciones((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ mostrarNotificacion }}>
      {children}
      <div className="notification-container">
        {notificaciones.map((notif) => (
          <div key={notif.id} className={`notification-toast notification-${notif.type}`}>
            <div className="notification-icon">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notif.type === 'success' ? <MdCheckCircle size={24} /> : notif.type === 'error' ? <MdError size={24} /> : <MdInfo size={24} />}
              </span>
            </div>
            <div className="notification-message">{notif.message}</div>
            <button className="notification-close" onClick={() => eliminarNotificacion(notif.id)}>
              <MdClose />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};
