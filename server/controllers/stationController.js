import Station from "../models/station.js";
import mongoose from 'mongoose';

// Add Station
const addStation = async (req, res) => {
  try {
    let {
      name,
      location,
      capacity,
      owner,
      state,
      plugType,
      chargingTime,
      kilowatt,
      availableSlots,
      pricePerKWh,
      supportedVehicles,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (!name || !owner) {
      return res.status(400).json({ message: "Name and owner are required." });
    }

    // Parse supportedVehicles if it's a string (from formData)
    if (typeof supportedVehicles === 'string') {
      supportedVehicles = supportedVehicles.split(',').map(v => v.trim());
    }

    // Build new station object
    const newStation = new Station({
      name,
      location,
      capacity,
      owner,
      state,
      plugType,
      chargingTime,
      kilowatt,
      availableSlots,
      pricePerKWh,
      supportedVehicles,
      latitude,
      longitude,
      image: req.file ? `/uploads/${req.file.filename}` : undefined, // undefined will use default image if schema has one
      isReserved: false,
      reservedBy: null,
      reservationTime: null,
    });

    console.log("New station data:", newStation);

    // Save to DB
    const savedStation = await newStation.save();

    res.status(201).json(savedStation);

  } catch (error) {
    console.error("Error creating station:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get All Stations
const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find().populate("owner");
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Station By ID
const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id).populate("owner");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid station ID" });
    }

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.status(200).json({ "station": station });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Station
const updateStation = async (req, res) => {
  try {
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

// Delete Station
const deleteStation = async (req, res) => {
  try {
    const deleted = await Station.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.status(200).json({ message: "Station deleted" });
  } catch (error) {
    console.error("Error deleting station:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reserve
const reserveStation = async (req, res) => {
  const { userId } = req.body;
  const expirationTime = 30 * 60 * 1000; // Reservation expiration time (30 minutes)

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const stationId = req.params.stationId;
    const station = await Station.findById(stationId);

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    // Check if station is already reserved
    if (station.isReserved) {
      return res.status(400).json({ message: "Station is already reserved" });
    }

    // Check if there are available slots for reservation
    if (station.availableSlots <= 0) {
      return res.status(400).json({ message: "No available slots for reservation" });
    }

    // Reserve the station
    station.isReserved = true;
    station.reservedBy = userId;
    station.reservationTime = new Date();
    station.reservationExpiresAt = new Date(Date.now() + expirationTime);  // Set expiration time
    station.availableSlots -= 1;  // Decrease available slots

    await station.save();

    // Automatically free the station after 30 minutes if not extended
    setTimeout(async () => {
      const updatedStation = await Station.findById(stationId);

      // If the reservation has not been extended, release the station
      if (updatedStation && updatedStation.reservationExpiresAt <= new Date()) {
        updatedStation.isReserved = false;
        updatedStation.reservedBy = null;
        updatedStation.reservationTime = null;
        updatedStation.availableSlots += 1; // Increase available slots

        await updatedStation.save();
        console.log(`Station ${stationId} has been automatically freed after reservation expiration.`);
      }
    }, expirationTime);

    res.status(200).json({ message: "Station reserved successfully", station });
  } catch (error) {
    console.error("Error reserving station:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Extend Reservation
const extendReservation = async (req, res) => {
  const { userId } = req.body;
  const extensionTime = 30 * 60 * 1000; // Additional 30 minutes

  try {
    const stationId = req.params.stationId;
    const station = await Station.findById(stationId);

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    // Check if the user is the one who reserved the station
    if (station.reservedBy !== userId) {
      return res.status(400).json({ message: "You are not the one who reserved this station" });
    }

    // Extend the reservation time
    station.reservationExpiresAt = new Date(Date.now() + extensionTime);  // Extend expiration time
    await station.save();

    // Reset the automatic release timer
    setTimeout(async () => {
      const updatedStation = await Station.findById(stationId);

      // If the reservation has not been extended, release the station
      if (updatedStation && updatedStation.reservationExpiresAt <= new Date()) {
        updatedStation.isReserved = false;
        updatedStation.reservedBy = null;
        updatedStation.reservationTime = null;
        updatedStation.availableSlots += 1; // Increase available slots

        await updatedStation.save();
        console.log(`Station ${stationId} has been automatically freed after reservation expiration.`);
      }
    }, extensionTime); // Reset the expiration time for the extension

    res.status(200).json({ message: "Reservation extended successfully", station });
  } catch (error) {
    console.error("Error extending reservation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Free a Station Manually
const freeStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    if (!station.isReserved) {
      return res.status(400).json({ message: "Station is not reserved" });
    }

    // Free the station
    station.isReserved = false;
    station.reservedBy = null;
    station.reservationTime = null;
    station.availableSlots += 1;  // Increase available slots

    await station.save();

    res.status(200).json({ message: "Station reservation canceled", station });
  } catch (error) {
    console.error("Error freeing station:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Stations by Owner ID
const getStationsByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Invalid owner ID" });
    }

    const stations = await Station.find({ owner: ownerId }).populate("owner");

    if (stations.length === 0) {
      return res.status(404).json({ message: "No stations found for this owner" });
    }

    res.status(200).json(stations);
  } catch (error) {
    console.error("Error fetching stations by owner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export {getStationsByOwner, addStation, getAllStations, getStationById, updateStation, deleteStation, reserveStation, freeStation };
