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
                    src={`data:image/png;base64,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`}
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
                    variant="h5" color={colors.greenAccent[800]}
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
                title="List of users"
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
                title="Calendar"
                to='/dashboard/calendar'
                icon={<CalendarTodayOutlinedIcon></CalendarTodayOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="FAQ Page"
                to='/dashboard/faq'
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
                to='/dashboard/bar'
                icon={<BarChartOutlinedIcon></BarChartOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Pie Chart"
                to='/dashboard/pie'
                icon={<PieChartOutlineOutlinedIcon></PieChartOutlineOutlinedIcon>}
                selected={selected}
                setSelected={setSelected}
            ></Item>
             <Item
                title="Line Chart"
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