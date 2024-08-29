import { useState } from "react";
import { Sidebar,Menu ,MenuItem } from "react-pro-sidebar";

import {Box , IconButton, Typography , useTheme} from '@mui/material';
import {Link} from 'react-router-dom';
import { tokens } from "../../theme";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

const Item =({title , to , selected ,icon, setSelected})=>{
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);
    return(
        <MenuItem 
        active={selected===title} 
        style={{color:colors.grey[100]}} 
        onClick={()=>setSelected(title)}
        
        >
         
         <Link to={to} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                {icon}
                <Typography style={{ marginLeft: '10px' }}>{title}</Typography>
            </Link>
        
           
        </MenuItem>
    )
}

const SideBar = () => {
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed]=useState(false);
    const [selected , setSelected]=useState("Dashboard");


    return (
        <Box
        sx={{
            height:'100vh',
            "& .sidebar-inner": {
                background: `${colors.primary[300]} !important`,
              },
              "& .pro-icon-wrapper": {
                backgroundColor: "transparent !important",
              },
              "& .pro-inner-item": {
                padding: "5px 35px 5px 20px !important",
              },
              "& .pro-inner-item:hover": {
                color: "#868dfb !important",
              },
              "& .pro-menu-item.active": {
                color: "#6870fa !important",
              },
             
            }}
      
        >
      
            <Sidebar collapsed={isCollapsed}   >
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
              
            }}
          >

         
            {!isCollapsed && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    ml="15px">
                        <Typography
                        variant="h3" color={colors.grey[100]}
                        >ADMINS</Typography>
                        <IconButton onClick={()=>setIsCollapsed(!isCollapsed)}>
                            <MenuOutlinedIcon/>
                        </IconButton>
                </Box>
            )}
        </MenuItem>
      
        {/* User*/}
        {!isCollapsed && (
            <Box mb="25px">
                <Box display="flex " justifyContent="center " alignItems="center" >
                    <img 
                    alt="profile-user" width="100px"
                    height="100px"
                    src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXjfteBTUl75WmV0yhUOGQJrJsHfDU-hE9Rg&s`}
                    style={{cursor:"pointer" , borderRadius:"50%"}}/>
                </Box>
                <Box textAlign="center "
              >
                    <Typography
                      variant="h2"
                      color={colors.grey[400]}
                      fontWeight="bold" sx={{m:"10px 0 0 0"}}
                    >Rania</Typography>
                    <Typography
                    variant="h5" color={colors.greenAccent[800]}
                    >Rawene</Typography>
                </Box>
            </Box>
        )}
        {/* Menu Items*/}

        <Box paddingLeft={isCollapsed ? undefined : "10%"} marginTop= {isCollapsed? undefined : "0px"}
        >
            <Item
                title="Dashboard"
                to='/'
                icon={<HomeOutlinedIcon></HomeOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
            <Typography
            variant="h6" color={colors.grey[500]}
            sx={{m:"15px 0 5px 20px"}}
            >Data</Typography>
             <Item
                title="Manage Team"
                to='/team'
                icon={<PeopleOutlineOutlinedIcon></PeopleOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Contact information"
                to='/contacts'
                icon={<ContactsOutlinedIcon></ContactsOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Invoices Balances"
                to='/invoices'
                icon={<ReceiptOutlinedIcon></ReceiptOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
                     <Typography
            variant="h6" color={colors.grey[500]}
            sx={{m:"15px 0 5px 20px"}}
            >Pages</Typography>
             <Item
                title="Profile Form"
                to='/form'
                icon={<PersonOutlinedIcon></PersonOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Calendar"
                to='/calendar'
                icon={<CalendarTodayOutlinedIcon></CalendarTodayOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="FAQ Page"
                to='/faq'
                icon={<HelpOutlineOutlinedIcon></HelpOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
                 <Typography
            variant="h6" color={colors.grey[500]}
            sx={{m:"15px 0 5px 20px"}}
            >Chart</Typography>
             <Item
                title="BAr Chart"
                to='/bar'
                icon={<BarChartOutlinedIcon></BarChartOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Pie Chart"
                to='/pie'
                icon={<PieChartOutlineOutlinedIcon></PieChartOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Line Chart"
                to='/line'
                icon={<TimelineOutlinedIcon></TimelineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Geography Chart"
                to='/geography'
                icon={<MapOutlinedIcon></MapOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
        </Box>
 
        </Menu>
        </Sidebar>
     
        </Box>
     );
};
 
export default SideBar;