import { Box} from "@mui/material";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {mockDataContacts} from "../../data/mockData";
import { useTheme } from "@mui/material";
import Header from "../../components/Header";
import { blue } from "@mui/material/colors";

const Contacts = () => {
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);
    const columns=[
        {field:"id", headerName:"ID", flex : 0.5},
        {field:"RegistrarId", headerName:"Registar Id"},
        {field:"name", headerName:"Name",flex:1, cellClassName:"name-column--cell"},
        {field:"age", headerName:"Age",type:"number",headerAlign:"left",align:"left"},
        {field:"phone",headerName:"Phone Number ",flex:1},
        {field:"email", headerName:"Email",flex:1},
        {field:"adress", headerName:"Adress",flex:1},
        {field:"city", headerName:"City",},
        

    ]
    
    return (  
    <Box m="20px">
        <Header title="Contacts" subtitle="Managing the list of Contacts for Future Reference"></Header>
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
            },
           "& .MuiDataGrid-toolbarContainer .MuiButtonText":{
            color:`${colors.grey[100]} !important`
           }
        }}>
            <DataGrid 
            rows={mockDataContacts}
            columns={columns} components={{toolbar:GridToolbar}}>
                
            </DataGrid>
        </Box>
    </Box>);
}
 
export default Contacts;