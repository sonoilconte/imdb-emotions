function sendError(status, message, res) {
  res.status(status).json({
    status,
    message,
  });
}

module.exports = sendError;
