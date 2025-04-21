import { Box, Typography, useTheme, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, FormControl, InputLabel } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

// Enum values for state
const stateOptions = ["active", "inactive", "Under Maintenance"];



const RowActions = ({ refreshData, row }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");
  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    name: row.name || "",
    location: row.location || "",
    plugType:row.plugType || "",
    state: row.state || "N/A",
    kilowatt:row.kilowatt,
    capacity:row.capacity,
    chargingTime:row.chargingTime,
    marque:row.marque,
    owner:row.owner

  });


  const fetchPartners = async () => {
    try {
      const res = await axios.get("http://localhost:3000/partner/");
      if (res?.data?.partners) {
        setPartners(res.data.partners);
      } else {
        console.error("No partners found in response");
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };
  useEffect(() => {
    fetchPartners();
  }, []);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
    handleCloseMenu();
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/station/${row.id}`);
      refreshData(); // Refresh list
      setToastOpen(true); // Show success toast
    } catch (error) {
      console.error("Error deleting station:", error);
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleUpdateClick = () => {
    setUpdateOpen(true);
    handleCloseMenu();
  };



  const handleUpdateSubmit = async () => {
    try {
      await axios.put(`http://localhost:3000/station/${row.id}`, formData);
      refreshData();
      setToastMessage("Station updated successfully!");
      setToastSeverity("success");
      setUpdateOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      setToastMessage("Error updating station.");
      setToastSeverity("error");
    } finally {
      setToastOpen(true);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuItem onClick={handleUpdateClick}>Update</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this station?</DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>



      <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)} fullWidth>
        <DialogTitle>Update Station</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Station Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleFormChange}
            fullWidth
          />
            <TextField
            margin="dense"
            label="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleFormChange}
            fullWidth
          />

          <TextField
            margin="dense"
            label="plugType"
            name="plugType"
            value={formData.plugType}
            onChange={handleFormChange}
            fullWidth
          />
                    <FormControl fullWidth margin="dense">
            <InputLabel>Owner</InputLabel>
            <Select
              name="owner"
              value={formData.owner}
              onChange={handleFormChange}
              label="Owner"
            >
              {partners.map((partner) => (
                <MenuItem key={partner._id} value={partner._id}>
                  {partner.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
           <TextField
            margin="dense"
            label="chargingTime"
            name="chargingTime"
            value={formData.chargingTime}
            onChange={handleFormChange}
            fullWidth
          />
           <TextField
            margin="dense"
            label="kilowatt"
            name="kilowatt"
            value={formData.kilowatt}
            onChange={handleFormChange}
            fullWidth
          />
           <TextField
            margin="dense"
            label="marque"
            name="marque"
            value={formData.marque}
            onChange={handleFormChange}
            fullWidth
          />
          <FormControl fullWidth margin="dense">
  <InputLabel>State</InputLabel>
  <Select
    name="state"
    value={formData.state}
    onChange={handleFormChange}
    label="State"
  >
    {stateOptions.map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
  </Select>
  </FormControl>

          {/* Add more fields if needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleToastClose} severity="success" sx={{ width: "100%" }}>
          Station deleted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};


const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [stations, setStations] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    plugType: "",
    state: "",
    kilowatt: "",
    chargingTime: "",
    capacity: "",
    marque: "",
    owner: "",
  });

  // Fetch partners
  const fetchPartners = async () => {
    try {
      const res = await axios.get("http://localhost:3000/partner/");
      if (res?.data?.partners) {
        setPartners(res.data.partners);
      } else {
        console.error("No partners found in response");
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Fetch stations
  const fetchStations = async () => {
    try {
      const res = await axios.get("http://localhost:3000/station/");
      const formatted = res.data.map((s) => ({
        id: s._id,
        name: s.name,
        plugType: s.plugType,
        location: s.location,
        state: s.state,
        kilowatt: s.kilowatt,
        chargingTime: s.chargingTime || "N/A",
        capacity: s.capacity || "N/A",
        marque: s.marque || "N/A",
        ownerName: s.owner?.name || "N/A",
        ownerEmail: s.owner?.email || "N/A",
        createdAt: new Date(s.createdAt).toLocaleDateString(),
      }));
      setStations(formatted);
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:3000/station/add", formData);
      handleCloseAdd();
      fetchStations(); // Refresh the list
    } catch (error) {
      console.error("Failed to add station:", error);
    }
  };

  const handleOpenAdd = () => setOpenAddModal(true);
  const handleCloseAdd = () => setOpenAddModal(false);

  const columns = [

    { field: "name", headerName: "Name", flex: 1 },
    { field: "plugType", headerName: "Plug Type", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "kilowatt", headerName: "kW", flex: 0.5 },
    { field: "chargingTime", headerName: "Charging Time", flex: 1 },
    { field: "capacity", headerName: "Capacity", flex: 1 },
    { field: "marque", headerName: "Marque", flex: 1 },
    { field: "ownerName", headerName: "Owner", flex: 1 },
    { field: "ownerEmail", headerName: "Email", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => <RowActions row={params.row} refreshData={fetchStations} />,
    },
  ];

  return (
    <Box m="20px">
      <Header title="STATIONS" subtitle="List of All Stations" />
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#5c7767",
            "&:hover": { backgroundColor: "#678d77" },
          }}
          onClick={handleOpenAdd}
        >
          Add New Station
        </Button>
      </Box>

      <Box
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaderRow": { backgroundColor: "#5c7767", borderBottom: "none" },
          "& .MuiDataGrid-VirtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={stations}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* Add Station Dialog */}
      <Dialog open={openAddModal} onClose={handleCloseAdd}>
        <DialogTitle>Add New Station</DialogTitle>
        <DialogContent>
          {["name", "location", "plugType", "kilowatt", "chargingTime", "capacity", "marque"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              fullWidth
              onChange={handleChange}
            />
          ))}

          <FormControl fullWidth margin="dense">
            <InputLabel id="owner-select-label">Owner</InputLabel>
            <Select
              labelId="owner-select-label"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
            >
              {partners.length > 0 ? (
                partners.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No partners available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>State</InputLabel>
            <Select
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            >
              {stateOptions.map((stateOption) => (
                <MenuItem key={stateOption} value={stateOption}>
                  {stateOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Station</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
