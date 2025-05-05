import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/user.js';  // Adjust if the path is different
import Role from '../models/role.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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
    address:req.body.address,
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
            return res.status(401).send("password incorrect");
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
};



const sendPasswordReset= async(req,res)=>{
    try{
        const {email}=req.body;
        const user=await User.findOne({email});

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        const resetToken=jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '30m'}
        );

        const resetLink=`http://localhost:3000/auth/reset-password/${resetToken}`;
        
        
        const transporter=nodemailer.createTransport({
            service:'gmail',
         
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false,  // Disable rejecting unauthorized SSL certificates (optional)
              },
        });
        
        const mailOptions={
            from : {
                name:"VoltWise Solutions",
                adress: process.env.SMPTP_USER},
            to: email,
            subject: 'Password Reset',
            html: `
                 <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f7fc;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 50px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    color: #2a3d66;
                }
                .header h1 {
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333333;
                    margin-top: 20px;
                }
                .btn {
                    display: inline-block;
                    padding: 15px 30px;
                    margin-top: 20px;
                    background-color:rgb(149, 176, 205);
                    color: #000000;
                    font-size: 16px;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                }
                .btn:hover {
                    background-color: #0056b3;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #777777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the button below to reset your password:</p>
                    <a href="${resetLink}" class="btn">Reset Password</a>
                    <p>If you did not request a password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Voltwise Solutions. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
                `
        };
        console.log(resetLink)
       
        await transporter.sendMail(mailOptions);
        return res.status(200).json({message: 'Reset password email sent'});
      
    }
    catch(err){
        console.error('Error sending password reset email:', err);
        return res.status(500).json({message: 'Something went wrong'});
    }
}

const resetPassword = async (req, res) => {
    console.log('Reset password route reached');

    const { token } = req.params;
    let decodedToken;

    try {
        // Decoding the JWT token
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decodedToken);

        // Find user by decoded userId
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if password exists in the request body
        if (!req.body.password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Log the password to check if it's coming through correctly
        console.log('Password from request body:', req.body.password);

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        console.log('Hashed password:', hashedPassword);

        // Update password (make sure to hash the password first)
        user.password = hashedPassword;

        // Save the updated user
        await user.save();

        // Send a success response only once
        return res.status(200).json({ message: 'Password reset successful' });

    } catch (err) {
        console.error('Error resetting password:', err);
        
        // Check if response headers have already been sent
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

const resetPasswordPage = (req, res) => {
    const { token } = req.params;
    // Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // If token is valid, render password reset page
        res.render('reset-password', { token });  // Or serve the HTML page
    } catch (err) {
        return res.status(400).send("Invalid or expired token");
    }
};



export  {register,
    login,
    sendPasswordReset,
    resetPassword,
    resetPasswordPage,
 
};