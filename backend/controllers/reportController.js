const Report = require('../models/reportModel');
// const { io } = require('../server');

// GET all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();

    displayReportsNumber = req.params.number;

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: reports,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// CREATE report
exports.createReport = async (req, res) => {
  try {
    const newReport = await Report.create(req.body);

    io.emit("reportCreated", newReport);  // 🔥 SOCKET EMIT

    res.status(201).json({
      status: 'success',
      data: newReport,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// UPDATE report
exports.updateReport = async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // io.emit("reportUpdated", updated); // 🔥 SOCKET EMIT

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
