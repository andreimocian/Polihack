const express = require('express');
const victimController = require('../controllers/victimController');

const router = express.Router();

router.post('/report', victimController.createReport);

module.exports = router;