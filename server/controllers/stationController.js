import Station from "../models/station.js";
import mongoose from 'mongoose';


// Add Station
const addStation = async (req, res) => {
  try {
    let {
      name,
      location,
      capacity,
      owner,  // <-- owner ID expected here
      state,
      plugType,
      chargingTime,
      kilowatt,
      availableSlots,
      pricePerKWh,
      supportedVehicles,
      longitude,
      latitude,
    } = req.body;

    // Validate required fields
    if (!name || !owner) {
      return res.status(400).json({ message: "Name and owner ID are required." });
    }

    // Optional: Validate if owner looks like a MongoDB ObjectId
    if (!owner.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid owner ID format." });
    }

    // Parse supportedVehicles if it's a string (from formData)
    if (typeof supportedVehicles === 'string') {
      supportedVehicles = supportedVehicles.split(',').map(v => v.trim());
    }

    // Make sure location is provided and valid
    if (!location || !location.type || !Array.isArray(location.coordinates)) {
      return res.status(400).json({ message: "Valid location with type and coordinates is required." });
    }

    // Build new station object
    const newStation = new Station({
      name,
      location,
      capacity,
      owner,  // <-- owner ID directly used here
      state,
      plugType,
      chargingTime,
      kilowatt,
      availableSlots,
      pricePerKWh,
      supportedVehicles,
      longitude,
      latitude,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
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
    // Validate station ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid station ID format." });
    }

    // Check if station exists
    const existingStation = await Station.findById(req.params.id);
    if (!existingStation) {
      return res.status(404).json({ message: "Station not found" });
    }

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
      longitude,
      latitude,
    } = req.body;

    // Validate owner ID if provided
    if (owner && !owner.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid owner ID format." });
    }

    // Parse supportedVehicles if it's a string (from formData)
    if (supportedVehicles && typeof supportedVehicles === 'string') {
      supportedVehicles = supportedVehicles.split(',').map(v => v.trim());
    }

    // Validate location if provided
    if (location && (!location.type || !Array.isArray(location.coordinates))) {
      return res.status(400).json({ message: "Valid location with type and coordinates is required." });
    }

    // Build update object with only provided fields
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (owner !== undefined) updateData.owner = owner;
    if (state !== undefined) updateData.state = state;
    if (plugType !== undefined) updateData.plugType = plugType;
    if (chargingTime !== undefined) updateData.chargingTime = chargingTime;
    if (kilowatt !== undefined) updateData.kilowatt = kilowatt;
    if (availableSlots !== undefined) updateData.availableSlots = availableSlots;
    if (pricePerKWh !== undefined) updateData.pricePerKWh = pricePerKWh;
    if (supportedVehicles !== undefined) updateData.supportedVehicles = supportedVehicles;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (latitude !== undefined) updateData.latitude = latitude;
    
    // Handle image update if new file is uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    console.log("Update station data:", updateData);

    // Update the station
    const updatedStation = await Station.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Station updated successfully", 
      station: updatedStation 
    });

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
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

const  recommendNearbyStations=async({
  userLatitude,
  userLongitude,
  maxDistance = 10,
  limit = 5,
  plugType = null,
  availableSlotsRequired = true,
  vehicleType = null
}) =>{
  try {
    const filter = {
      state: "active",
    };

    if (plugType) {
      filter.plugType = plugType;
    }

    if (availableSlotsRequired) {
      filter.availableSlots = { $gt: 0 };
    }

    if (vehicleType) {
      filter.supportedVehicles = vehicleType;
    }
    console.log("🔍 Mongoose filter:", filter);

    console.log("Fetching stations with filter:", filter);
    const stations = await Station.find(filter);
    console.log("Found stations:", stations.length);
    
    const stationsWithDistance = stations.map(station => {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        station.latitude,
        station.longitude
      );

      return {
        ...station.toObject(),
        distance: distance // keep it as a number
      };
    });

    const nearbyStations = stationsWithDistance
      .filter(station => station.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);


console.log("📊 Filtered nearby stations:", nearbyStations.length);
    return nearbyStations;
  } catch (error) {
    console.error("Erreur lors de la recommandation des stations:", error);
    throw error;
  }
}

const nearby = async (req, res) => {
  try {
    console.log("Requête reçue - URL:", req.url);
    console.log("Paramètres reçus:", req.query);
    
    // Récupérer les paramètres de l'URL (query parameters)
    const {
      latitude,
      longitude,
      maxDistance,
      limit,
      plugType,
      vehicleType,
      requireAvailableSlots
    } = req.query;

    // Vérifier que les coordonnées sont fournies
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les coordonnées de l\'utilisateur sont requises' 
      });
    }

    // Convertir les paramètres en types appropriés
    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);
    const maxDistanceValue = maxDistance ? parseFloat(maxDistance) : 10;
    const limitValue = limit ? parseInt(limit) : 5;
    const availableSlotsRequired = requireAvailableSlots === 'true';

    // Obtenir les recommandations
    const recommendations = await recommendNearbyStations({
      userLatitude,
      userLongitude,
      maxDistance: maxDistanceValue,
      limit: limitValue,
      plugType,
      availableSlotsRequired,
      vehicleType
    });

    // Renvoyer les résultats
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stations proches:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des stations proches',
      error: error.message
    });
  }
};

const addRating = async (req, res) => {
  const { stars, comment, userId } = req.body; // Get userId from body now
  const stationId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (stars < 1 || stars > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const station = await Station.findById(stationId);
    if (!station) return res.status(404).json({ message: 'Station not found' });

   

    // Add rating
    station.ratings.push({ user: userId, stars, comment });

    // Update average
    const total = station.ratings.reduce((sum, r) => sum + r.stars, 0);
    station.averageRating = total / station.ratings.length;

    await station.save();

    res.status(200).json({ message: 'Rating added', station });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export {getStationsByOwner,nearby,addRating, addStation, getAllStations, getStationById, updateStation, deleteStation, reserveStation, freeStation };
