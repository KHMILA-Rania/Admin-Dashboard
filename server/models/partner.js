import mongoose from "mongoose";

const partnerSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    adress:{
        type:String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    email:{

        type:String,
        required: true
    },
    password:{
      type:String,
      required: true  
    },
      role:[{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Role', 
            default: 'user' }]

});

const Partner=mongoose.model("Partner", partnerSchema);
export default Partner;