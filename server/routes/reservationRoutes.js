import express from 'express';
import { expireReservations,getUserReservations, createReservation, extendReservation, cancelReservation ,getAllReservations} from '../controllers/reservationController.js';

const router = express.Router();

router.post('/:stationId/reserve', createReservation);
router.post('/:id/extend', extendReservation);

router.patch('/:reservationId/cancel', cancelReservation);
router.get('/user/:userId', getUserReservations);
router.get('/all', getAllReservations);
export default router;
