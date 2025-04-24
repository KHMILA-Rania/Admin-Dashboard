import express from 'express';
import dotenv from 'dotenv';
import mongoose, { Error }  from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import partnerRoutes from './routes/partnerRoutes.js'
import complaintRoutes from './routes/complaintRoutes.js';
import stationRoutes from './routes/stationRoutes.js'
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import cors from 'cors';
dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins=['http://102.25.110.228:3000','http://localhost:3001']

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use(express.json());


const PORT = process.env.PORT || 3001;

const mongoURI = process.env.DB; 

mongoose.connect(mongoURI, {connectTimeoutMS: 10000, useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

 

//auth routes
app.use('/auth',authRoutes);


//role routes
app.use('/role',roleRoutes);

//user routes
app.use('/user',userRoutes);

//complaint routes
app.use('/complaint',complaintRoutes);

//partner routes
app.use('/partner',partnerRoutes);

//station routes
app.use("/station",stationRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
   
  });



