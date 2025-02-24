import  mongoose from 'mongoose';

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      adress:{
        type: String,
        required: true
      },
      phoneNumber:{
        type: String,
        required: true
      },
      age:{
        type: Number,
        required: true
      },
      vehicleType:{
        type: String,
      
      },
      plugType:{
        type: String,
      },
      role:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role', 
        default: 'user' }]
});



  
const User = mongoose.model('User', userSchema);

export default User;