const app = require('express')();
const dotenv = require('dotenv');

dotenv.config();
const getEmotions = require('./controllers/getEmotions');

app.get('/', (req, res) => {
  console.log({ req });
  res.json({ status: 200 });
});

app.get('/films', getEmotions);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

// Export here such that ./tests/apiTests.js can access server 
module.exports = app;
