function handleError(status, message, res) {
  console.log('error', { status, message });
  res.status(status).json({
    status,
    message
  });
}

module.exports = handleError;
