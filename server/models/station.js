import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  marque: {
    type: String,
    required: false,
  },
  plugType: {
    type: String,
    required: true,
  },
  capacity: Number,
  location: String,
  state: {
    type: String,
    enum: ["active", "inactive", "maintenance"],
    default: "active",
  },
  chargingTime: String,
  kilowatt: Number,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner", // assuming the partner model is named 'Partner'
    required: true,
  },
  image: {
    type: String,
    required: false,
    default: "https://img.freepik.com/premium-vector/electrical-charging-station-icon_617585-1878.jpg?w=740",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // New Attributes
  availableSlots: {
    type: Number,
    required: true,  // Ensure to track available slots
  },
  pricePerKWh: {
    type: Number,
    required: true,  // Set a price per KWh for the station
  },
  supportedVehicles: {
    type: [String],  // Array of supported vehicles (e.g., "Tesla", "Nissan Leaf")
    required: true,
  },
  latitude: {
    type: Number,
    required: true,  // Latitude of the station
  },
  longitude: {
    type: Number,
    required: true,  // Longitude of the station
  },
  
  // Reservation-related fields
  isReserved: {
    type: Boolean,
    default: false,  // Track if the station is reserved
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming there's a User model for the client
    required: false,  // This will be filled when a reservation is made
  },
  reservationTime: {
    type: Date,
    required: false,  // Time when the station was reserved
  },
  reservationExpiresAt: {  // New field for expiration
    type: Date,
    default: null
  },
});

export default mongoose.model('Station', stationSchema);
