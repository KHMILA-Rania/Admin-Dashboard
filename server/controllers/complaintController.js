import  Complaint from '../models/complaint.js';
import mongoose from 'mongoose'; // Make sure mongoose is imported
import User from '../models/user.js';
const CreateComplaint = async (req, res) => {
    try {
        const { userId, subject, description, stationId } = req.body;

        console.log('User ID from request:', userId);

        // Validate userId
        const validUserId = mongoose.Types.ObjectId.isValid(userId) ? userId : null;
        if (!validUserId) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Fetch the user to confirm existence
        const user = await User.findById(validUserId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate stationId if provided
        let validStationId = null;
        if (stationId && mongoose.Types.ObjectId.isValid(stationId)) {
            validStationId = stationId;
        }

        // Create the new complaint
        const newComplaint = new Complaint({
            userId: validUserId,
            subject,
            description,
            stationId: validStationId || null, // Only add it if it's valid
        });

        await newComplaint.save();
        res.status(200).json({ message: 'Complaint submitted', Complaint: newComplaint });
    } catch (err) {
        console.error('Error:', err);
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
        const complaints = await Complaint.find().populate('userId', 'name email'); // populate only name and email
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints', details: error.message });
    }
};


const transferComplaintToPartner = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { partnerId } = req.body;
        
        const complaint = await Complaint.findById(complaintId);
        
        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        complaint.assignedPartnerId = partnerId; // Assign the partner
        await complaint.save();
        
        res.status(200).json({ message: "Complaint transferred successfully", complaint });
    } catch (error) {
        res.status(500).json({ error: "Failed to transfer complaint", details: error.message });
    }
};


const getComplaintsByPartner = async (req, res) => {
    try {
        const complaintsByPartner = await Complaint.aggregate([
            { $match: { assignedPartnerId: { $ne: null } } }, // Filter to only include complaints with an assigned partner
            { 
                $group: { 
                    _id: "$assignedPartnerId", // Group by the assigned partner ID
                    count: { $sum: 1 } // Count the number of complaints per partner
                }
            },
            { 
                $lookup: {
                    from: "partners", // Join with the 'partners' collection
                    localField: "_id", // Local field (assignedPartnerId)
                    foreignField: "_id", // Foreign field in the 'partners' collection
                    as: "partner" // Include partner details in the result
                }
            },
            { $unwind: "$partner" }, // Flatten the partner details
            { 
                $project: {
                    _id: 0, // Hide the original _id
                    partnerName: "$partner.name", // Include partner name
                    count: 1 // Include the count of complaints
                }
            }
        ]);
        
        res.status(200).json(complaintsByPartner); // Return the result
    } catch (error) {
        console.error("Error fetching complaints by partner:", error);
        res.status(500).send("Error fetching complaints by partner");
    }
};

export{
    CreateComplaint,
    deleteComplaint,
    getComplaintById,
    getAllComplaints,
    getComplaintsByUser,
    transferComplaintToPartner,
    getComplaintsByPartner

}