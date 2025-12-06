const express = require('express');
const navigationController = require('../controllers/navigationController');

const router = express.Router();

router.get('/', navigationController.getNavigationRoute);

module.exports = router;