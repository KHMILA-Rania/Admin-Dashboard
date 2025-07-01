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
  // Changed from single selectedPartner string to an object to track per complaint
  const [selectedPartners, setSelectedPartners] = useState({});
  const [loadingPartners, setLoadingPartners] = useState(true); // Loading state for partners

const getBackgroundColor = (status, assignedPartnerId) => {
  console.log("Checking status:", status, "Assigned partner:", assignedPartnerId);

  if (status === "pending" && !assignedPartnerId) {
    return "#FF9800"; // Orange for unassigned
  }

  switch (status) {
    case "pending":
      return "#516669";
    case "resolved":
      return "#4CAF50";
    case "in-progress":
      return "#2196F3";
    default:
      return "#BDBDBD";
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
        if (Array.isArray(response.data.partners)) {
          setPartners(response.data.partners);
        } else {
          console.error("Partners data is not an array", response.data);
          setPartners([]);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
        setPartners([]);
      } finally {
        setLoadingPartners(false);
      }
    };

    fetchComplaints();
    fetchPartners();
  }, []);

  // Function to handle complaint transfer
  const handleTransfer = async (complaintId) => {
    const partnerId = selectedPartners[complaintId]; // get selected partner for this complaint

    if (!partnerId) {
      alert("Please select a partner to transfer the complaint.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:3000/complaint/${complaintId}/transfer`,
        { partnerId },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Complaint transferred successfully:", response.data);

      // Clear selected partner only for this complaint
      setSelectedPartners(prev => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? { ...complaint, assignedPartnerId: partnerId }
            : complaint
        )
      );
    } catch (error) {
      console.error("Error transferring complaint:", error);
    }
  };

  const StationName = ({ stationId }) => {
    const [stationName, setStationName] = useState(null);

    useEffect(() => {
      const fetchStation = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/station/${stationId}/station`);
          console.log("Station response:", response.data);
          setStationName(response.data.station.owner.name);
        } catch (error) {
          console.error('Error fetching station name:', error);
        }
      };

      fetchStation();
    }, [stationId]);

    return <p>{stationName || 'Station owner not provided '}</p>;
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
    backgroundColor: getBackgroundColor(complaint.status, complaint.assignedPartnerId), // ✅ pass assignedPartnerId
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
                    Submitted by: {user ? `${user.name} (${user.email})` : "Unknown User"} — Status: {complaint.status} -station owner: <StationName stationId={complaint.stationId} />
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
                  <InputLabel id={`partner-select-label-${complaint._id}`}>Assign Partner</InputLabel>
                  <Select
                    labelId={`partner-select-label-${complaint._id}`}
                    value={selectedPartners[complaint._id] || ""}
                    onChange={(e) =>
                      setSelectedPartners((prev) => ({
                        ...prev,
                        [complaint._id]: e.target.value,
                      }))
                    }
                    label="Assign Partner"
                    disabled={loadingPartners}
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
                  disabled={!selectedPartners[complaint._id]} // Disable if no partner selected for this complaint
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
