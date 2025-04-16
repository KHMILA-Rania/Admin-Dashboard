import  Complaint from '../models/complaint.js';
import mongoose from 'mongoose'; // Make sure mongoose is imported

const CreateComplaint=async(req, res)=>{
    try{
        const {userId , subject , description}=req.body;
        const validUserId = mongoose.Types.ObjectId.isValid(userId)
            ? mongoose.Types.ObjectId(userId)
            : null;

            if (!validUserId) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }
    
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
        const newComplaint=new Complaint({userId, subject, description});
        await newComplaint.save();
        res.status(200).json({message:'complaint submitted', Complaint: newComplaint});
    }
    catch (err) {
        res.status(500).json({message: err.message, Complaint: err.message});
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
    getAllComplaints

}