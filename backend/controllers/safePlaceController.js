const SafePlace = require('../models/safePlaceModel');
const { io } = require('../server');

// GET all reports
exports.getAllSafePlaces = async (req, res) => {
  try {
    const safePlaces = await SafePlace.find();

    res.status(200).json({
      status: 'success',
      results: safePlaces.length,
      data: safePlaces,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// CREATE report
exports.createSafePlace = async (req, res) => {
  try {
    const newSafePlace = await SafePlace.create(req.body);

    // io.emit("safePlaceCreated", newSafePlace);  // 🔥 SOCKET EMIT

    res.status(201).json({
      status: 'success',
      data: newSafePlace,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

