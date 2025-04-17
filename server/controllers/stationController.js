import Station from "../models/station.js";
import mongoose from 'mongoose'

const addStation=async (req, res)=>{
    const {name, location,capacity,owner, state, plugType,
        chargingTime,kilowatt

    }=req.body;
    try{
        if (!name || !owner) {
            return res.status(400).json({ message: "Name and owner are required." });
          }

        const newStation=new Station({
            name, 
            location,
            capacity,
            owner,
            state,
            plugType,
            chargingTime,
            kilowatt

        });
        await newStation.save();
        res.status(201).json({message: "station created successfully"})
    }
    catch(error){

        console.error("Error creating station:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getAllStations=async (req,res)=>{
    try{
        const stations= await Station.find().populate("owner");
        res.status(200).json(stations)
    }
    catch(error){
        res.status(500).json({message:"internal server error"})
    }
};

const getStationById=async(req,res)=>{
    try{
        const station= await Station.findById(req.params.id).populate("owner");
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid station ID" });
          }
        if (!station) {
            return res.status(404).json({ message: "Station not found" });
          }

        res.status(200).json({"station":station})
    }
    catch(error){
        res.status(500).json({message:"internal server error"})   
    }
};

const updateStation=async(req,res)=>{
    try{
        const updated = await Station.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
          );

          if (!updated) {
            return res.status(404).json({ message: "Station not found" });
          }
          res.status(200).json({ message: "Station updated", station: updated });
        } catch (error) {
          console.error("Error updating station:", error);
          res.status(500).json({ message: "Internal server error" });
        }
};

const deleteStation=async(req,res)=>{
    try{
        const deleted= await Station.findByIdAndDelete(req.params.id);
        if(!deleted){
            return res.status(404).json({ message: "Station not found" });
        }
        res.status(200).json({ message: "Station deleted" });
    }
    catch(error){
        console.error("Error deleting station:", error);
    res.status(500).json({ message: "Internal server error" })
    }
}

export {addStation, getAllStations,getStationById, updateStation, deleteStation}