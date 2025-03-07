import express from 'express';
import dotenv from 'dotenv';
import mongoose  from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import nodemailer from 'nodemailer';
import cors from 'cors';
dotenv.config();
const app = express();
app.use(cors({
  origin:  'http://192.168.1.132:3000'
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
   
  });



