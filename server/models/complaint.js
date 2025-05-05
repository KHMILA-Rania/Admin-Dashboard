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
});

// Create and export the model
const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
