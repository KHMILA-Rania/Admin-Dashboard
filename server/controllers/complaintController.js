import  Complaint from '../models/complaint.js';
import mongoose from 'mongoose'; // Make sure mongoose is imported
import User from '../models/user.js';
const CreateComplaint = async (req, res) => {
    try {
        const { userId, subject, description } = req.body;

        // Debugging the userId being passed
        console.log('User ID from request:', userId);  // Log it to see its format

        // Make sure userId is a valid ObjectId
        const validUserId = mongoose.Types.ObjectId.isValid(userId) ? userId : null;

        if (!validUserId) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Log userId as ObjectId before query
        console.log('Searching for user with ID:', validUserId);

        // Fetch the user from the database using the correct format
        const user = await User.findById(validUserId);  // Use validUserId directly

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the new complaint
        const newComplaint = new Complaint({
            userId: validUserId,
            subject,
            description,
        });

        await newComplaint.save();
        res.status(200).json({ message: 'Complaint submitted', Complaint: newComplaint });
    } catch (err) {
        console.error('Error:', err);  // Add this to log any error
        res.status(500).json({ message: err.message });
    }
};


// Get complaints for a specific user
const getComplaintsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Fetch complaints for this user
        const complaints = await Complaint.find({ userId: userId });

        if (!complaints.length) {
            return res.status(404).json({ message: 'No complaints found for this user' });
        }

        res.status(200).json({ complaints });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};





const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        await Complaint.findByIdAndDelete(id);
        res.status(200).json({ message: 'Complaint deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete complaint', details: error.message });
      }
};

const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        res.status(200).json(complaint);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaint', details: error.message });
      }
};

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.status(200).json(complaints);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints', details: error.message });
      }
};

export{
    CreateComplaint,
    deleteComplaint,
    getComplaintById,
    getAllComplaints,
    getComplaintsByUser

}