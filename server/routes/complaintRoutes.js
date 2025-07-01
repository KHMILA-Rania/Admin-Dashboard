import express from 'express';
const router = express.Router();

// Importing the complaint controller
import { CreateComplaint, deleteComplaint,markComplaintNotificationsAsSeen,getNotificationCount,getComplaintsByUserWithNotifications, getComplaintsByPartner,getComplaintById, getAllComplaints, getComplaintsByUser, transferComplaintToPartner, updateComplaintStatus }from '../controllers/complaintController.js';
import verifyToken from '../middleware/verifyToken.js';

// Route to add a new complaint
router.post('/add', CreateComplaint);

// Route to delete a complaint by ID
router.delete('/delete/:id', deleteComplaint);

// Route to get a complaint by ID
router.get('/:id', getComplaintById);

router.get('/user/:userId', getComplaintsByUser);

// Route to get all complaints
router.get('/', getAllComplaints);

router.patch('/:complaintId/transfer',verifyToken, transferComplaintToPartner) 

router.get('/complaints/by-partner', getComplaintsByPartner);
router.patch('/:id/status',updateComplaintStatus);

router.get('/complaints/user/:userId/with-notifications', getComplaintsByUserWithNotifications);

// Get just the notification count (lightweight)
router.get('/complaints/user/:userId/notification-count', getNotificationCount);

// Mark notifications as seen
router.patch('/complaint/user/:userId/mark-seen', markComplaintNotificationsAsSeen);

export default router;
