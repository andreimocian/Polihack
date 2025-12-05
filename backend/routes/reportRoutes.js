const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.route('/').get(reportController.getAllReports).post(reportController.createReport);
router.route('/:id').patch(reportController.updateReport);

module.exports = router;