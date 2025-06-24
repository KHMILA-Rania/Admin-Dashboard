import express from 'express';
import { addComment,getAllComments,getCommentByStationId,getCommentByUserId,updateComment,deleteComment} from '../controllers/commentController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/add',verifyToken, addComment);
router.get('/',verifyToken, getAllComments);
router.get('/user/:userId', getCommentByUserId);
router.get('/station/:stationId',verifyToken, getCommentByStationId);
router.put('/:commentId', verifyToken, updateComment);
router.delete('/:commentId', verifyToken, deleteComment);


export default router;
