import express from 'express';
const router = express.Router();

// Importing the complaint controller
import { CreateComplaint, deleteComplaint, getComplaintById, getAllComplaints, getComplaintsByUser, transferComplaintToPartner }from '../controllers/complaintController.js';

// Route to add a new complaint
router.post('/add', CreateComplaint);

// Route to delete a complaint by ID
router.delete('/delete/:id', deleteComplaint);

// Route to get a complaint by ID
router.get('/:id', getComplaintById);

router.get('/user/:userId', getComplaintsByUser);

// Route to get all complaints
router.get('/', getAllComplaints);

router.patch('/:complaintId/transfer', transferComplaintToPartner) 

export default router;
