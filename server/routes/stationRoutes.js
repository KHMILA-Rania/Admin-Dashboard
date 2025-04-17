import express from 'express';
import { addStation, deleteStation, getAllStations, getStationById, updateStation } from '../controllers/stationController.js';
const router=express.Router();


router.post("/add",addStation);
router.get("/", getAllStations);
router.get("/:id", getStationById);
router.put("/:id",updateStation);
router.delete("/:id", deleteStation)

export default router;
