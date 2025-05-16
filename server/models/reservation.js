import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed', 'expired'],
    default: 'active',
  },
  createdAt: {
  type: Date,
  default: Date.now,
},
});
const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;