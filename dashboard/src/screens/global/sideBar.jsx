import { useState } from "react";
import { Sidebar,Menu ,MenuItem } from "react-pro-sidebar";
import { useEffect } from "react";
import axios from "axios";
import {Box , IconButton, Typography , useTheme} from '@mui/material';
import {Link, useNavigation} from 'react-router-dom';
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
import './style.css'
const Item =({title , to , selected ,icon, setSelected})=>{
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);



    return(
        <MenuItem 
        active={selected===title} 
        style={{color:colors.primary[300]}} 
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
    const [userName,setUserName]=useState('')

    

    
    useEffect(()=>{
        const fetchUser=async()=>{
        const storedUser=JSON.parse(localStorage.getItem('user'));
        if(!storedUser) return;

        try{
            const response=await axios.get(`http://localhost:3000/user/${storedUser._id}`)
            setUserName(response.data.user.name);
            console.log(response)
        }
        catch(error){
            console.error('failed to fetch user', error)
        }}
        fetchUser()
    },[])
    return (
        <div  className="sidebar">

        <Box
       
        sx={{
            
            "& .sidebar-inner": {
                background: `${colors.primary[100]} `,
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
              color: colors.grey[400],
              
            }}
          >

         
            {!isCollapsed && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    ml="15px">
                        <Typography
                        className="sideText"
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
                    src={require('./admins.png')}
                    style={{cursor:"pointer" , borderRadius:"50%"}}/>
                </Box>
                <Box textAlign="center "
              >
                    <Typography
                      variant="h2"
                      color={colors.grey[400]}
                      fontWeight="bold" sx={{m:"10px 0 0 0"}}
                    >{userName}</Typography>
                    <Typography
                    variant="h5" color={colors.greenAccent[300]}
                    >Welcome back</Typography>
                </Box>
            </Box>
        )}
        {/* Menu Items*/}

        <Box paddingLeft={isCollapsed ? undefined : "10%"} marginTop= {isCollapsed? undefined : "0px"}
        >
            <Item
                className="sideText"
                title="Dashboard"
                to='/dashboard/dash'
                icon={<HomeOutlinedIcon></HomeOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
            <Typography
            variant="h6" color={colors.grey[500]}
            sx={{m:"15px 0 5px 20px"}}
            >Users Data</Typography>
             <Item
             className="sideText"
                title="List of Clients"
                to='/dashboard/team'
                icon={<PeopleOutlineOutlinedIcon></PeopleOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Partners"
                to='/dashboard/contacts'
                icon={<ContactsOutlinedIcon></ContactsOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Create Partner Form"
                to='/dashboard/form'
                icon={<PersonOutlinedIcon></PersonOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
            
                     <Typography
            variant="h6" color={colors.grey[500]}
            sx={{m:"15px 0 5px 20px"}}
            >Stations and complaints</Typography>
             <Item
                title="Stations"
                to='/dashboard/invoices'
                icon={<ReceiptOutlinedIcon></ReceiptOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Complaints"
                to='/dashboard/faq'
                icon={<HelpOutlineOutlinedIcon></HelpOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
              <Item
                title="Comments"
                to='/dashboard/comments'
                icon={<HelpOutlineOutlinedIcon></HelpOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Calendar"
                to='/dashboard/calendar'
                icon={<CalendarTodayOutlinedIcon></CalendarTodayOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
            
                 <Typography
            variant="h6" color={colors.grey[500]}
            sx={{m:"15px 0 5px 20px"}}
            >Chart</Typography>
             <Item
                title="complaints stats"
                to='/dashboard/bar'
                icon={<BarChartOutlinedIcon></BarChartOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Reservations stats"
                to='/dashboard/pie'
                icon={<PieChartOutlineOutlinedIcon></PieChartOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Ratings stats"
                to='/dashboard/line'
                icon={<TimelineOutlinedIcon></TimelineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Geography Chart"
                to='/dashboard/geography'
                icon={<MapOutlinedIcon></MapOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
        </Box>
 
        </Menu>
        </Sidebar>
     
        </Box>
        </div>
     );
};
 
export default SideBar;