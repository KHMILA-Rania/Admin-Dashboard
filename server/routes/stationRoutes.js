import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Station from '../models/station.js';
import mongoose from 'mongoose';
import { addStation, deleteStation,getStationsByOwner,addRating, freeStation, getAllStations, getStationById, reserveStation, updateStation, nearby } from '../controllers/stationController.js';
const router=express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../uploads/')); // make sure uploads/ exists
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + '-' + file.originalname;
      cb(null, uniqueName);
    }
  });

const upload = multer({ storage: storage });

router.patch("/reserve/:stationId",reserveStation)
router.patch("/free/:id",freeStation)
router.post("/add", upload.single('image'),addStation);
router.get("/", getAllStations);
router.get("/:id/station", getStationById);
router.put("/:id",updateStation);
router.delete("/:id", deleteStation)
router.get('/owner/:ownerId', getStationsByOwner); 
router.get('/nearby-stations', nearby)
router.post('/stations/:id/rate', addRating);


router.get('/fix-stations', async (req, res) => {
  try {
    const stations = await Station.find();

    for (let station of stations) {
      if (!station.location || !station.location.coordinates) {
        if (station.longitude != null && station.latitude != null) {
          station.location = {
            type: "Point",
            coordinates: [station.longitude, station.latitude],
          };
          await station.save();
        }
      }
    }

    res.send('Stations updated with location field');
  } catch (err) {
    console.error('Error updating stations:', err);
    res.status(500).send('Error updating stations');
  }


});

router.get('/create-index', async (req, res) => {
  try {
    await Station.collection.createIndex({ location: '2dsphere' });
    res.send('2dsphere index created on location field');
  } catch (err) {
    console.error('Error creating index:', err);
    res.status(500).send('Failed to create index');
  }
});

export default router;
