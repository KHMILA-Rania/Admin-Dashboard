import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the Complaint Schema
const complaintSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  assignedPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null },
  subject: {
    type: String,
    required: true,
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station', // Reference to Station model
    default: null,   // Only populated if it's a station-related complaint
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'closed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
   statusUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  isStatusUpdateSeen: {
    type: Boolean,
    default: true, // true for new complaints since user created them
  },
});

// Create and export the model
const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
