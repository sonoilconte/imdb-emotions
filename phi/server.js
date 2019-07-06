const app = require('express')();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const searchImdb = require('./controllers/search');

app.get('/', (req, res) => {
  console.log({ req });
  res.json({ status: 200 });
});

app.get('/films', searchImdb);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
