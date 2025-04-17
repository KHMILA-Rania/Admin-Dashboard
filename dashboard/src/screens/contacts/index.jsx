
import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import { tokens } from "../../theme";

import { ToastContainer, toast } from 'react-toastify';
import Header from "../../components/Header";
import { blue } from "@mui/material/colors";
import { useState, useEffect } from "react";
import {
    Box, Button, Typography, useTheme, TextField,
    Dialog, DialogContent, DialogTitle, DialogActions, MenuItem
  } from "@mui/material";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Contacts = () => {
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);
    const [partners,setPartners]=useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
   
  const [formData, setFormData] = useState({
    name: "",
    adress: "",
    phone: "",
    email: "",
    password: "",
    
    role: "",
  });
  
  
  
  const formatPartners = (partnersData) =>
    partnersData.map((partner) => ({
    id:partner._id,
    name: partner.name,
    adress: partner.adress,
    phone: partner.phone,
    email: partner.email,
    access: partner.role?.[0]?.name || "partner",
 
     
    }));


    const handleDelete = (userId) => {
        const toastId = toast.info(
          <div>
            <span>Are you sure you want to delete this user?</span>
            <Button onClick={() => deleteUser(userId, toastId)} color="primary" sx={{ ml: 1 }}>
              Yes
            </Button>
            <Button onClick={() => toast.dismiss()} color="secondary" sx={{ ml: 1 }}>
              No
            </Button>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            toastId:'delete-confirm'
          }
        );
      };
    

    const deleteUser = async (id, toastId) => {
        try {
          await axios.delete(`http://localhost:3000/partner/${id}`);
          setPartners(prevUsers => prevUsers.filter(user => user.id !== id));
          toast.dismiss(toastId);
          toast.success('User deleted successfully');
        } catch (error) {
          toast.error('Failed to delete user');
        }
      };

      const handleUpdate = (user) => {
        setSelectedPartner(user);
        setFormData({
            id: user._id, 
          name: user.name || "",
          adress: user.adress || "",
          phone: user.phone || "",
          email: user.email || "",
         
       
          role: user.access || "partner",
        });
        setIsDialogOpen(true);
      };




      useEffect(() => {
        const fetchData = async () => {
          try {
            const [partnersRes, rolesRes] = await Promise.all([
              axios.get("http://localhost:3000/partner/"),
              axios.get("http://localhost:3000/role")
            ]);
    
            setPartners(formatPartners(partnersRes.data.partners));
            setRoles(rolesRes.data);
          } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch data");
          }
        };
    
        fetchData();
      }, []);
    


      const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "role") {
          const selectedRole = roles.find(role => role.name === value);
          setFormData(prev => ({ 
            ...prev, 
            // Store both name and ID for easier handling
            role: {
              name: selectedRole.name,
              id: selectedRole._id
            } 
          }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      };

      const handleSave = async () => {
        try {
          const payload = {
            ...formData,
            age: parseInt(formData.age, 10), 
            role: formData.role?.id ? [formData.role.id] : []
          };
    
         const response= await axios.patch(`http://localhost:3000/partner/${selectedPartner.id}`, payload,
            {
                validateStatus: (status) => status < 500 // Don't throw for 4xx errors
              }
         );


         if (response.status >= 200 ) {
            toast.success("Partner updated successfully", { toastId: "update-success" });
            setIsDialogOpen(false);
         
    
         try {const res = await axios.get("http://localhost:3000/partner/");
          setPartners(formatPartners(res.data.partners));}
        catch(refreshError){
            console.error("Refresh error:", refreshError);
        } 
        }

          else {
            throw new Error(response.data.message || "Update failed");
          }
        } catch (error) {
          toast.error("Failed to update user");
        }
      };
    
  
  const columns=[
        {field:"id", headerName:"ID", flex : 0.5},
      
        {field:"name", headerName:"Name",flex:1, cellClassName:"name-column--cell"},
        {field:"adress", headerName:"Adress",headerAlign:"left",align:"left"},
        {field:"phone",headerName:"Phone Number ",flex:1},
        {field:"email", headerName:"Email",flex:1},
      
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            minWidth: 180,
            filterable: false,
              flexWrap: 'nowrap',
            renderCell: ({ row }) => (
              <Box display="flex" gap="10px"  
              width="60%"
              m="6px auto"
              p="5px"
            
              sx={{
                width: '100%',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                overflow: 'visible' ,
                height:"80%"
              }}
              >
                <Button
                   onClick={() => handleDelete(row.id)}
                   size="small"
                   startIcon={<DeleteOutlineIcon />}
                    
                   sx={{
                     background: "#6d504a",
                     color: "white",
                     borderRadius: "6px",
                     px: 1.5,
                     py: 0.5,
                    
                     width: 70,
                     whiteSpace: 'nowrap' ,
                     minWidth: 70,
                     textTransform: "capitalize",
                     "&:hover": {
                       background: colors.redAccent[700],
                       boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                     },
                     transition: "all 0.3s ease"
                   }}
                >
                  Delete
                </Button>
                <Button
                  onClick={() => handleUpdate(row)}
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  sx={{
                    background: "#0857b0",
                    color: "white",
                    borderRadius: "6px",
                    px: 1.5,
                    py: 0.5,
                
                    minWidth: 70,
                    width: 70,
                    marginRight: "10px",
                    textTransform: "capitalize",
                     whiteSpace: 'nowrap',
                    "&:hover": {
                      background: colors.blueAccent[700],
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  Update
                </Button>




              </Box>
            ),}
        

    ]
    
    return (  
    <Box m="20px">
        <Header title="Partners" subtitle="Managing the list of partners "></Header>
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
                backgroundColor:"#427758"
            },
           "& .MuiDataGrid-toolbarContainer .MuiButtonText":{
            color:`${colors.grey[100]} !important`
           }
        }}>
            <DataGrid 
            rows={partners}
            columns={columns} getRowId={(row) => row.id} components={{toolbar:GridToolbar}}>
                
            </DataGrid>
        </Box>
        <ToastContainer position="top-right" autoClose={3000} />
    
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Update partner</DialogTitle>
        <DialogContent>
          {["name", "adress", "phone", "email"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.replace(/([A-Z])/g, " $1")}
              name={field}
              fullWidth
              value={formData[field]}
              onChange={handleFormChange}
            />
          ))}
          <TextField
            select
            margin="dense"
            label="Role"
            name="role"
            fullWidth
            value={formData.role}
            onChange={handleFormChange}
          >
            {roles.map((role) => (
              <MenuItem key={role._id} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

    
    
    </Box>
    
);
}
 
export default Contacts;