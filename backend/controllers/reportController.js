const Report = require('../models/reportModel');

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: {
        reports,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createReport = async (req, res) => {
  try {
    const newReport = await Report.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        report: newReport,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};