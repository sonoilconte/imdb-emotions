const axios = require('axios');
const SEARCH_URL = "https://movie-database-imdb-alternative.p.rapidapi.com/?page=1&r=json";
const axiosOptions = {
  method: 'get',
  headers: {
    'X-RapidAPI-Host': 'movie-database-imdb-alternative.p.rapidapi.com',
    'X-RapidAPI-Key': '44a1754a56msh7e591ca0b5f6bf8p177e0ejsne4c363ff2286',
  }
};


function searchImdb(req, searchResponse) {
  console.log('searching IMDB with query', req.query);
  axiosOptions.url = `${SEARCH_URL}&s=${req.query.name}`;
  axios(axiosOptions)
  .then(res => {
    if (res.data && res.data.Search && res.data.Search.length) {
      console.log({ data: res.data.Search });
      searchResponse.json({
        status: 200,
        data: res.data.Search
      });
    } else {
      const status = 404;
      searchResponse.status(status).json({
        status,
        message: `Film with name ${req.query.name} could not be found`
      });
    }
  })
  .catch(err => {
    console.log({ err });
  });
}

module.exports = searchImdb;
