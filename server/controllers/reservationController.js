import Reservation from '../models/reservation.js';
import Station from '../models/station.js';
import mongoose from 'mongoose';
const RESERVATION_DURATION = 30 * 60 * 1000; // 30 minutes

// Create a Reservation
const createReservation = async (req, res) => {
  const { userId, startTime, endTime, duration } = req.body;
  const stationId = req.params.stationId;

  if (!userId || !stationId) {
    return res.status(400).json({ message: "User ID and Station ID are required." });
  }

  try {
    const station = await Station.findById(stationId);
    if (!station) return res.status(404).json({ message: "Station not found." });

    if (station.availableSlots <= 0) {
      return res.status(400).json({ message: "No available slots." });
    }

    const now = new Date();

    // Prevent multiple active reservations per user
    const existingUserReservation = await Reservation.findOne({
      userId,
      status: 'active',
      endTime: { $gte: now }
    });

    if (existingUserReservation) {
      return res.status(400).json({ message: "You already have an active reservation." });
    }

    // Default duration and limit
    const MAX_DURATION = 2 * 60 * 60 * 1000; // 2 hours
    const finalDuration = duration || RESERVATION_DURATION;
    if (finalDuration > MAX_DURATION) {
      return res.status(400).json({ message: "Cannot reserve for more than 2 hours." });
    }

    const reservation = new Reservation({
      userId,
      stationId,
      startTime: startTime || now,
      endTime: endTime || new Date(now.getTime() + finalDuration),
      status: 'active',
    });

    await reservation.save();


    station.availableSlots -= 1;
     station.isReserved = true;
    await station.save();

    res.status(201).json({ message: "Reservation created successfully.", reservation });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


// Extend an active reservation
 const extendReservation = async (req, res) => {
  const { userId } = req.body;
  const reservationId = req.params.id;

  try {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) return res.status(404).json({ message: "Reservation not found." });
    if (reservation.userId.toString() !== userId) return res.status(403).json({ message: "Not your reservation." });
    if (reservation.status !== 'active') return res.status(400).json({ message: "Cannot extend this reservation." });

    reservation.endTime = new Date(reservation.endTime.getTime() + RESERVATION_DURATION);
    await reservation.save();

    res.status(200).json({ message: "Reservation extended.", reservation });
  } catch (err) {
    console.error("Error extending reservation:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Cancel a reservation (manual free)
const cancelReservation = async (req, res) => {
  const { userId } = req.body;
  const reservationId = req.params.reservationId;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });
    if (reservation.userId.toString() !== userId) return res.status(403).json({ message: "Not your reservation." });
    if (reservation.status !== 'active') return res.status(400).json({ message: "Reservation already ended/cancelled." });

    // Find the station associated with the reservation
    const station = await Station.findById(reservation.stationId);
    if (!station) return res.status(404).json({ message: "Associated station not found." });

    console.log(`Before cancel: reservation status = ${reservation.status}, station availableSlots = ${station.availableSlots}`);

    // Update reservation status
    reservation.status = 'cancelled';
    await reservation.save();

    // Update station's availableSlots and isReserved
    station.availableSlots += 1;
    station.isReserved = false; 
    await station.save();

    console.log(`After cancel: reservation status = ${reservation.status}, station availableSlots = ${station.availableSlots}`);

    res.status(200).json({ message: "Reservation cancelled.", reservation });
  } catch (err) {
    console.error("Error cancelling reservation:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};




// Pseudo cron logic
const expireReservations = async () => {
  const now = new Date();
  const expiredReservations = await Reservation.find({ status: 'active', endTime: { $lte: now } });

  for (const r of expiredReservations) {
    r.status = 'expired';
    await r.save();

    const station = await Station.findById(r.stationId);
    if (station) {
      station.availableSlots += 1;
      await station.save();
    }
  }
};



const getUserReservations = async (req, res) => {
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Find all reservations for the user, optionally populate station info
    const reservations = await Reservation.find({ userId }).populate('stationId');

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found for this user." });
    }

    res.status(200).json({ reservations });
  } catch (err) {
    console.error("Error fetching user reservations:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


export {expireReservations,getUserReservations, createReservation, extendReservation, cancelReservation};