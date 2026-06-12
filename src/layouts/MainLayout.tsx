import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;