import { useState, useEffect } from "react";
import {
  Box, Button, Typography, useTheme, TextField,
  Dialog, DialogContent, DialogTitle, DialogActions, MenuItem
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phoneNumber: "",
    email: "",
    vehicleType: "",
    plugType: "",
    role: "",
  });

  const formatUsers = (usersData) =>
    usersData.map((user) => ({
      id: user._id,
      name: user.name,
      age: user.age,
      phone: user.phoneNumber,
      email: user.email,
      access: user.role?.[0]?.name || "user",
      plugType: user.plugType,
      vehicleType: user.vehicleType,
    }));
    
    const filteredUsers = users.filter((user) =>
  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.phone.toLowerCase().includes(searchQuery.toLowerCase())
);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          axios.get("http://localhost:3000/user/getAll"),
          axios.get("http://localhost:3000/role")
        ]);

        setUsers(formatUsers(userRes.data.users));
        setRoles(rolesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

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
      }
    );
  };

  const deleteUser = async (id, toastId) => {
    try {
      await axios.delete(`http://localhost:3000/user/${id}`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      toast.dismiss(toastId);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdate = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      age: user.age || "",
      phoneNumber: user.phone || "",
      email: user.email || "",
      vehicleType: user.vehicleType || "",
      plugType: user.plugType || "",
      role: user.access || "user",
    });
    setIsDialogOpen(true);
  };

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

      await axios.patch(`http://localhost:3000/user/${selectedUser.id}`, payload);
      toast.success("User updated successfully");
      setIsDialogOpen(false);

      const res = await axios.get("http://localhost:3000/user/getAll");
      setUsers(formatUsers(res.data.users));
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const columns = [

    { field: "name", headerName: "Name", flex: 1, cellClassName: "name-column--cell" },
    { field: "age", headerName: "Age", type: "number", headerAlign: "left", align: "left" },
    { field: "phone", headerName: "Phone Number", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "vehicleType", headerName: "Vehicle Type", flex: 1 },
    { field: "plugType", headerName: "Plug Type", flex: 1 },
    {
      field: "access",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => (
        <Box
          width="60%"
          m="9px auto"
          p="5px"
          display="flex"
          justifyContent="center"
         sx={{ minWidth: 70, height:"60%"}}
          backgroundColor={
            access === "admin"
              ? colors.greenAccent[600]
              : access === "manager"
              ? colors.greenAccent[700]
              : colors.greenAccent[700]
          }
          borderRadius="4px"
        >
          {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
          {access === "manager" && <SecurityOutlinedIcon />}
          {access === "user" && <LockOpenOutlinedIcon />}
          <Typography color={colors.grey[100]}  sx={{ ml: "5px" } }>
            {access}
          </Typography>
        </Box>
      ),
    },
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
               background: colors.redAccent[600],
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
              background: colors.blueAccent[600],
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
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="List of users" subtitle="Managing Users" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[400] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[800],
          },
        }}
      >
        <Box display="flex" justifyContent="flex-end" mb={2}>
  <TextField
    label="Search Client"
    variant="outlined"
    size="small"
    onChange={(e) => setSearchQuery(e.target.value)}
    value={searchQuery}
    sx={{ width: 300 }}
  />
</Box>
       <DataGrid rows={filteredUsers} columns={columns} getRowId={(row) => row.id} />

      </Box>

      <ToastContainer position="top-right" autoClose={3000} />

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Update Client</DialogTitle>
        <DialogContent>
          {["name", "age", "phoneNumber", "email", "vehicleType", "plugType"].map((field) => (
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
};

export default Team;
