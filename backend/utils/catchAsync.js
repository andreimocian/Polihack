module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    const status = Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const message = err.message || "Internal server error";

    res.status(status).json({ message });
  });
};