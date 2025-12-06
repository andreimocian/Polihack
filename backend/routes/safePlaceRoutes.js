const express = require('express');
const safePlaceController = require('../controllers/safePlaceController');

const router = express.Router();

router.post('/', safePlaceController.createSafePlace);
router.get('/', safePlaceController.getAllSafePlaces);

module.exports = router;