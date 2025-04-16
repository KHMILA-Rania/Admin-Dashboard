
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/lineChart";
import GeographyChart from "../../components/geoChart";
import BarChart from "../../components/barChart";
import StatBox from "../../components/statBox";
import ProgressCircle from "../../components/progressCircle";
import SideBar from "../global/sideBar";
import TopBar from "../global/topBar";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { Outlet } from 'react-router-dom';
import { tokens } from "../../theme";

  
const MainDashboard=()=> {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return(
    <Box sx={{ display: 'flex' }}  className="h-screen">
          {/* Sidebar */}
          
          <SideBar />
    
        <Box sx={{ flexGrow: 1, overflowY: 'auto', height:'100%' }}  >
          <Outlet />
          {/* main content */}
          </Box>

    </Box>)
}

export default MainDashboard