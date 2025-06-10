import mongoose from 'mongoose';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
const getAllUsers=async (req,res)=>{

    try{
        const users=await User.find().populate("role","name");
        res.status(200).json({"users" : users});
    }catch(e){
        res.status(500).json({"error" : e.message});
    }
};

const deleteUser= async (req,res)=>{
    try{
        
        const user=await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({"user deleted" : user});
        if(!user){
            return res.status(404).json({"error" : "user not found"});
        }
    }
    catch(e){
        res.status(500).json({"error" : e.message});
    }
};

const getUserById=async (req,res)=>{
    try{
        const user= await User.findById(req.params.id)
        if(!user){
            return res.status(404).send("user not found");

        }
        return res.status(200).json({message: "user",user:user})

    }catch(error){
        return res.status(500).send("error");
    }
};



const updateUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateData = { ...req.body };

        // Only hash if password is present and not empty
        if (updateData.password && updateData.password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            // Don't include password if it's empty
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
};

export  {getAllUsers,
    deleteUser,
    getUserById,
    updateUser,
};
