// hazardRoutes.js
const express = require('express');
const router = express.Router();
const HazardController = require('../controllers/hazardController');

// Define the endpoints
router.get('/wildfires', HazardController.getWildfires);
router.get('/floods', HazardController.getFloods);
router.get('/landslides', HazardController.getLandslides);
router.get('/severe-storms', HazardController.getSevereStorms);
router.get('/earthquakes', HazardController.getEarthquakes);

// The aggregate endpoint
router.get('/all', HazardController.getAllHazards);

module.exports = router;