/*
 * Requests to GET /films?title={title} will provide a response containing
 * the plot of the film queried, and an emotions analysis of the film plot.
 * The bottleneck library is used to limit the rate of outgoing requests to
 * the vendor APIs
 */

const app = require('express')();
const dotenv = require('dotenv');

dotenv.config();
const getEmotions = require('./controllers/getEmotions');

// This endpoint may be used in the future for serving static files
app.get('/', (req, res) => {
  res.json({ status: 200 });
});

app.get('/films', getEmotions);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

// Export app here such that ./tests/apiTests.js can access server
module.exports = app;
