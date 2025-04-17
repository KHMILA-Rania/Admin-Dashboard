import mongoose, { mongo } from 'mongoose';

const stationSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    marque:{
        type: String,
        required: false,
    },
    plugType:{
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
      kilowatt:Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partner", // this assumes your partner model is named 'Partner'
        required: true,
      },

    createdAt: {
        type: Date,
        default: Date.now,
      },
})

export default mongoose.model('Station', stationSchema)