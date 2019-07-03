const app = require('express')();
const bodyParser = require('body-parser');

app.get('/', (req, res) => {
  console.log({ req });
  res.json({ status: 200 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
