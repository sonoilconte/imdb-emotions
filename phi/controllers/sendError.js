function sendError(status, message, res) {
  console.log('error', { status, message });
  res.status(status).json({
    status,
    message
  });
}

module.exports = sendError;
