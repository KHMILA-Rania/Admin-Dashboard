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
}

export { addPartner}
