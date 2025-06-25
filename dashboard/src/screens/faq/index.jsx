import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Header from "../../components/Header";
import axios from "axios";

const Faq = () => {
  const [complaints, setComplaints] = useState([]);
  const [partners, setPartners] = useState([]); // Store the list of partners
  const [selectedPartner, setSelectedPartner] = useState(""); // Store selected partner ID
  const [loadingPartners, setLoadingPartners] = useState(true); // Loading state for partners

  // Function to return background color based on complaint status
  const getBackgroundColor = (status) => {
    switch (status) {
      case "pending":
        return "#516669"; // Yellow (Pending)
      case "resolved":
        return "#4CAF50"; // Green (Resolved)
      case "in-progress":
        return "#2196F3"; // Blue (In Progress)
      default:
        return "#BDBDBD"; // Grey (Default)
    }
  };

  useEffect(() => {
    // Fetch complaints from the backend
    const fetchComplaints = async () => {
      try {
        const response = await axios.get("http://localhost:3000/complaint");
        setComplaints(response.data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    // Fetch partners from the backend (or provide mock data)
    const fetchPartners = async () => {
      try {
        const response = await axios.get("http://localhost:3000/partner");
        // Access the partners array from the response object
        if (Array.isArray(response.data.partners)) {
          setPartners(response.data.partners);
        } else {
          console.error("Partners data is not an array", response.data);
          setPartners([]); // Set empty array if data is not in the correct format
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
        setPartners([]); // Set empty array in case of error
      } finally {
        setLoadingPartners(false); // Set loading to false after data is fetched
      }
    };

    fetchComplaints();
    fetchPartners();
  }, []);

  // Function to handle complaint transfer
  const handleTransfer = async (complaintId) => {
    try {
      if (!selectedPartner) {
        alert("Please select a partner to transfer the complaint.");
        return;
      }
      const response = await axios.patch(
        `http://localhost:3000/complaint/${complaintId}/transfer`,
        { partnerId: selectedPartner }
      );
      console.log("Complaint transferred successfully:", response.data);
      setSelectedPartner("");
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? { ...complaint, assignedPartnerId: selectedPartner }
            : complaint
        )
      );
    } catch (error) {
      console.error("Error transferring complaint:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Complaints" subtitle="List of user-submitted complaints" />
      {complaints.length === 0 ? (
        <Typography>No complaints found.</Typography>
      ) : (
        complaints.map((complaint) => {
          const user = complaint.userId;

          return (
            <Accordion
              key={complaint._id}
              
              sx={{
                backgroundColor: getBackgroundColor(complaint.status),
                marginBottom: "10px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography variant="h5" color="#a7c2b6">
                    {complaint.subject}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Submitted by: {user ? `${user.name} (${user.email})` : "Unknown User"} — Status: {complaint.status}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{complaint.description}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Submitted on: {new Date(complaint.createdAt).toLocaleString()}
                </Typography>

                {/* Dropdown for selecting partner */}
                <FormControl fullWidth margin="normal">
                  <InputLabel id="partner-select-label">Assign Partner</InputLabel>
                  <Select
                    labelId="partner-select-label"
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    label="Assign Partner"
                    disabled={loadingPartners} // Disable the dropdown while loading partners
                  >
                    {loadingPartners ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : partners.length === 0 ? (
                      <MenuItem disabled>No partners available</MenuItem>
                    ) : (
                      partners.map((partner) => (
                        <MenuItem key={partner._id} value={partner._id}>
                          {partner.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Transfer Button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleTransfer(complaint._id)}
                  disabled={!selectedPartner} // Disable button if no partner is selected
                  sx={{ marginTop: "10px" }}
                >
                  Transfer to Partner
                </Button>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
};

export default Faq;
