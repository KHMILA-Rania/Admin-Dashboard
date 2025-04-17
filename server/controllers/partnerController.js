import Partner from "../models/partner.js";
import Role from "../models/role.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const addPartner=async (req, res)=>{
    try{

        const role=await Role.find({name: {$in : req.body.role || ['partner']}})
        const {name , adress, phone , email, password}=req.body;


         const salt=await bcrypt.genSalt(10);
            const hashpassword= await bcrypt.hash(req.body.password,salt);
    const newPartner= new Partner({
        name:name , adress : adress, phone : phone,
         email: email , password:hashpassword ,
          role:role.map(role => role._id),
    })
    newPartner.save();
      res.status(201).json({message: "partner added successfullly ", partner: newPartner})
    }
    catch(error){
        res.status(500).json({message: "error creating a partner"})
    }
};

const deletePartner=async (req,res)=>{
    try{
        const id=req.params.id;
        const selecteduser=await Partner.findByIdAndDelete(id);

        res.status(200).json({message: "succes ", "partner deleted":selecteduser })
    }
    catch(error){
        res.status(500).json({message:"erro deleting partner"})
    }
};

const updatePartner=async (req,res)=>{
    try{
        const userID=req.params.id;
        const updateData=req.body;
        const selecteduser=await Partner.findById(userID)
        if (!selecteduser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const updatedUser = await Partner.findByIdAndUpdate(userID, updateData, { new: true });
        return res.status(200).json({ message: "partner updated successfully", user: updatedUser });
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
};

const getPartnerById=async (req,res)=>{
    try{
        const partner=await Partner.findById(req.params.id);
        res.status(200).json({"Partner":partner})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
};

const getAllPartners=async (req,res)=>{
    try{
        const partners=await Partner.find().populate("role","name");
        res.status(200).json({"partners" : partners});
    }
    catch(error){
        res.status(500).json({ error:error.message})
    }

}

export { addPartner, deletePartner, updatePartner, getPartnerById, getAllPartners}
