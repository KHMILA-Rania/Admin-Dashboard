import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { addStation, deleteStation, getAllStations, getStationById, reserveStation, updateStation } from '../controllers/stationController.js';
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
router.post("/add", upload.single('image'),addStation);
router.get("/", getAllStations);
router.get("/:id", getStationById);
router.put("/:id",updateStation);
router.delete("/:id", deleteStation)

export default router;
