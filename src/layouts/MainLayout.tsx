import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from '../pages/marketplace/components/TopHeader';
import { useAuth } from '../contexts/AuthContext';
import './MainLayout.css';

const MainLayout = () => {
  const { usuario } = useAuth();
  const showTopHeader = usuario?.rol === 'Seller' || usuario?.rol === 'Customer';

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {showTopHeader && <TopHeader />}
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;