const Report = require('../models/reportModel');
const catchAsync = require('../utils/catchAsync');

exports.createReport = catchAsync(async (req, res, next) => {
    const report = req.body;
    const newReport = await Report.create(report);
    res.status(201).json({
        status: 'success',
        data: {
            report: newReport,
        },
    });
})