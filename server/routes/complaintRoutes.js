import express from 'express';
const router = express.Router();

// Importing the complaint controller
import { CreateComplaint, deleteComplaint, getComplaintById, getAllComplaints }from '../controllers/complaintController.js';

// Route to add a new complaint
router.post('/add', CreateComplaint);

// Route to delete a complaint by ID
router.delete('/delete/:id', deleteComplaint);

// Route to get a complaint by ID
router.get('/:id', getComplaintById);

// Route to get all complaints
router.get('/', getAllComplaints);

export default router;
