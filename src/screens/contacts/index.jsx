import { Box} from "@mui/material";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {mockDataContacts} from "../../data/mockData";
import { useTheme } from "@mui/material";
import Header from "../../components/Header";
import { blue } from "@mui/material/colors";

const Team = () => {
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);
    const columns=[
        {field:"id", headerName:"ID"},
        {field:"name", headerName:"Name",flex:1, cellClassName:"name-column--cell"},
        {field:"age", headerName:"Age",type:"number",headerAlign:"left",align:"left"},
        {field:"phone",headerName:"Phone Number ",flex:1},
        {field:"email", headerName:"Email",flex:1},
        {field:"access", headerName:"Access Level", flex:1, renderCell:({row:{access}})=>{
            return (
                <Box width="60%" m="0 auto"
                p="5px" display="flex"
                justifyContent="center"
                backgroundColor={
                    access==="admin"
                    ? colors.greenAccent[600]
                    : colors.greenAccent[700]
                }
                borderRadius="4px">
                    {access==="admin" && <AdminPanelSettingsOutlinedIcon></AdminPanelSettingsOutlinedIcon>}
                    {access==="manager" && <SecurityOutlinedIcon></SecurityOutlinedIcon>}
                    {access==="user" && <LockOpenOutlinedIcon></LockOpenOutlinedIcon>}
                    <Typography>{access}</Typography>
                </Box>
            )
        }}

    ]
    
    return (  
    <Box m="20px">
        <Header title="Team" subtitle="Managing the Team Members"></Header>
        <Box m="40px 0 0 0" height="75vh"
        sx={{
            "& .MuiDataGrid-root":{
                border:"none"
            },
            "& .MuiDataGrid-cell":{
                borderBottom:"none"
            },
            "& .name-column--cell":{
                color:colors.greenAccent[300]
            },
            "& .MuiDataGrid-columnHeaderRow":{
                backgroundColor:blue,
                borderBottom:"none"
            },
            "& .MuiDataGrid-VirtualScroller":{
                backgroundColor:colors.primary[400]
            },
            "& .MuiDataGrid-footerContainer":{
                borderTop:"none",
                backgroundColor:colors.blueAccent[700]
            }
        }}>
            <DataGrid 
            rows={mockDataTeam}
            columns={columns}>
                
            </DataGrid>
        </Box>
    </Box>);
}
 
export default Team;