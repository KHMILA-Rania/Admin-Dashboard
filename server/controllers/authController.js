import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/user.js';  // Adjust if the path is different
import Role from '../models/role.js';
import jwt from 'jsonwebtoken';

const register=async (req,res)=>{
    try{
    console.log("Registering user:", req.body);

    const role=await Role.find({name: {$in : req.body.role || ['user']}})
    if (role.length === 0) {
        return res.status(400).json({ message: "Invalid role(s) provided" });
    }

    if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
    }

   


    const salt=await bcrypt.genSalt(10);
    const hashpassword= await bcrypt.hash(req.body.password,salt);

   

    const newUser=new User({
    name:req.body.name,
    email:req.body.email,
    adress:req.body.adress,
    age:req.body.age,
    vehicleType:req.body.vehicleType,
    plugType:req.body.plugType,
    phoneNumber:req.body.phoneNumber,
    password:hashpassword,
    role:role.map(role => role._id),
});

await newUser.save();
return res.status(200).json("user registered successfully");}
catch(err) {
    console.error("Error during user registration:", err);
        return res.status(500).json("Something went wrong");
}
};



const login =async (req, res) => {
    try{

        console.log('Request body:', req.body);
        const user=await User.findOne({email:req.body.email})
       .populate("role","name")
       .exec();

       
       if (!user){
        console.log('User not found');
            return res.status(404).send("user not found");
        }
        console.log('User found:', user);

        const ispasswordCorrect= await bcrypt.compare(req.body.password,user.password);
        
        if(!ispasswordCorrect) {
            console.log('Password incorrect');
            return res.status(404).send("password incorrect");
        }
        const token = jwt.sign({
            id: user._id,  role:user.role
        },
    process.env.JWT_SECRET,{ expiresIn: '1h' });

    console.log('Generated token:', token);
    console.log('JWT Secret:', process.env.JWT_SECRET);
    
    res.cookie("token",token,{httpOnly :true , secure: process.env.NODE_ENV === 'production', sameSite: 'strict'});
    
    
    return res.status(200).json({
        status: 200,
        message: "Login successful",
        data: user
    });
    
     
    
    }

    catch(err){
        console.error('Error during login:', err);
        return res.status(500).send('something went wrong ');
    }
}


export  {register,
    login,
};