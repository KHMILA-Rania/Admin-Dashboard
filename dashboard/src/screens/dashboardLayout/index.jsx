
import { Outlet } from 'react-router-dom';
import SideBar from "../global/sideBar";
import TopBar from '../global/topBar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
     <TopBar></TopBar>
      <SideBar />

      {/* Main content (changes based on route) */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <Outlet /> {/* 👈 Nested routes render here */}
      </div>
      
    </div>
  );
};

export default DashboardLayout;