import { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from "axios";
import getToken from "../../services/authService";

const Comment = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      const token = getToken();
      try {
        const response = await axios.get("http://localhost:3000/comment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);
  const handleDelete = async (commentId) => {
    console.log("Deleting comment with ID:", commentId);
  const token = getToken();
  try {
    await axios.delete(`http://localhost:3000/comment/admin/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Remove the deleted comment from the state so UI updates instantly
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  } catch (error) {
    console.error("Failed to delete comment:", error);
  }
};


  return (
    <Box m="20px">
      <Header title="Comments" subtitle="All user feedback on stations" />
      {comments.length === 0 ? (
        <Typography>No comments found.</Typography>
      ) : (
        comments.map((comment) => (
          <Accordion key={comment._id} 
          defaultExpanded
           sx={{ backgroundColor: '#344d57' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography color={colors.greenAccent[500]} variant="h5">
                {comment.user?.name.trim()} commented on{" "}
                {comment.station?.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {comment.station?.image && (
                <img
                  src={comment.station.image}
                  alt="station"
                  style={{ width: "100px", borderRadius: "8px", marginBottom: "10px" }}
                />
              )}
              <Typography mb={1}>{comment.commentText}</Typography>
              <Typography variant="caption" color="gray">
                Posted on {new Date(comment.createdAt).toLocaleString()}
              </Typography>
               <button
    style={{
      marginTop: "10px",
      padding: "5px 10px",
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer"
    }}
    onClick={() => handleDelete(comment._id)}
  >
    Delete
  </button>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default Comment;
